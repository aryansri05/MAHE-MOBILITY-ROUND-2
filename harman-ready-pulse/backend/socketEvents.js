const { classifyMessageIntent, summarizeQueue } = require('./ai_engine/prompts');
const queue = require('./state/queue');
const preferences = require('./state/preferences');

let currentNetwork = "5G";
let deadZoneStartTime = null;

/** Emit the full stats snapshot to all clients */
function broadcastStats(io) {
    io.emit('stats_updated', queue.stats);
}

function formatDuration(ms) {
    const elapsedSecs = Math.floor(ms / 1000);
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

/**
 * Flushes the queue through the AI summarizer and emits results.
 * Called when entering 5G or on manual clear_queue.
 */
async function flushQueue(io, timeOffline) {
    const missedCount = queue.length;
    if (missedCount === 0) return;

    const messagesToProcess = queue.getAllSorted();

    console.log(`[AI] Summarizing ${missedCount} prioritized messages...`);

    let summaryText = "";
    try {
        summaryText = await summarizeQueue(messagesToProcess);
        io.emit('ai_summary_generated', { text: summaryText, count: missedCount, offlineDuration: formatDuration(timeOffline || 0), messages: messagesToProcess });
    } catch (error) {
        console.error("[AI ERROR]", error);
        io.emit('ai_summary_generated', {
            text: `Welcome back. You missed ${missedCount} updates.`,
            count: missedCount,
            offlineDuration: formatDuration(timeOffline || 0),
            messages: messagesToProcess
        });
    }

    // Atomic grouped batch delivery of the missed notifications
    // Phase 4: Suppress sending the batch. We only want the summary card on the frontend.
    // io.emit('receive_batch_messages', messagesToProcess);

    queue.clear();
    io.emit('queue_updated', 0);
    broadcastStats(io);
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`📡 New Device Connected: ${socket.id}`);

        // Initial State Sync
        socket.emit('network_state_changed', currentNetwork);
        socket.emit('queue_updated', queue.length);
        socket.emit('stats_updated', queue.stats);

        /**
         * EVENT: network_state_changed
         * When switching to 5G from DEAD_ZONE, auto-flush the pending queue.
         */
        socket.on('network_state_changed', async (state) => {
            const previousNetwork = currentNetwork;
            currentNetwork = state;
            io.emit('network_state_changed', state);
            console.log(`[NETWORK] State changed to ${state}`);

            if (state === "DEAD_ZONE" && previousNetwork === "5G") {
                deadZoneStartTime = Date.now();
            }

            if (state === "5G" && previousNetwork === "DEAD_ZONE" && queue.length > 0) {
                const timeOffline = deadZoneStartTime ? (Date.now() - deadZoneStartTime) : 0;
                console.log(`[NETWORK] Entered 5G with ${queue.length} pending. Auto-flushing for ${timeOffline}ms...`);
                await flushQueue(io, timeOffline);
            }
        });

        /**
         * EVENT: inject_mock_message
         *
         * Routing Decision Tree:
         *   1. Compute intent via AI (EMERGENCY, OOO, SPAM, ROUTINE)
         *   2. Assign Absolute Priority (0 to 999) using Preferences Engine
         *   3. Network Routing
         */
        socket.on('inject_mock_message', async (msg) => {
            msg.timestamp = msg.timestamp || Date.now();
            msg.app = msg.app || "Unknown";

            // Step 1: Edge AI Classification (Async)
            const intent = msg.is_emergency ? 'EMERGENCY' : await classifyMessageIntent(msg.text);
            msg.intent = intent;

            // Step 2: Algorithmic Triage (Sync Priority Scoring)
            const priorityData = preferences.calculateAbsolutePriority(msg, intent);
            msg.absolutePriority = priorityData.priority;
            
            // Setting helpers for UI / Logging
            msg.is_emergency = (msg.absolutePriority === 0);
            msg.isContactOverride = priorityData.isContactOverride;
            msg.isMuted = priorityData.isMuted;
            msg.priority = msg.absolutePriority;

            console.log(`[TRIAGE] Message from ${msg.sender} on ${msg.app} -> Intent: ${intent}, Absolute Priority: ${msg.absolutePriority}`);

            // Step 3: Network Routing
            if (currentNetwork === "5G") {
                queue.trackDelivered(msg);
                io.emit('receive_live_message', msg);
                console.log(`📲 Live Message Broadcasted (5G) - Priority: ${msg.absolutePriority}`);
            } else {
                // DEAD_ZONE Logic
                if (msg.absolutePriority === 0 || msg.absolutePriority === 1) {
                    // Bypass queue (Emergency or Priority 1 / Rank 1 VIP)
                    queue.trackDelivered(msg);
                    if (msg.absolutePriority === 0) {
                        io.emit('emergency_alert', msg);
                        console.log("🚨 Emergency Alert Broadcasted (DEAD_ZONE)");
                    } else {
                        io.emit('receive_live_message', msg);
                        console.log("⚡ Priority 1 Breakthrough Broadcasted (DEAD_ZONE)");
                    }
                } else {
                    // Queue for Later (Absolute Priority > 1)
                    queue.push(msg);
                    console.log(`📦 Message Queued (Priority ${msg.absolutePriority}). Current queue size: ${queue.length}`);
                    io.emit('queue_updated', queue.length, queue.savedData); // Count & bytes saved
                    broadcastStats(io); // Update full stats
                }
            }
        });

        /**
         * EVENT: update_preferences
         * Receives config from the Settings modal and updates the engine.
         */
        socket.on('update_preferences', (config) => {
            if (!config) return;
            // Map frontend config format to backend rules
            Object.keys(config).forEach(appId => {
                const appConfig = config[appId];
                // Find matching rule by lowercasing
                const ruleKey = Object.keys(preferences.rules).find(
                    k => k.toLowerCase() === appId.toLowerCase()
                );
                if (ruleKey && appConfig.basePriority) {
                    preferences.rules[ruleKey].basePriority = appConfig.basePriority;
                    if (appConfig.timeWindow) {
                        preferences.rules[ruleKey].timeWindow = {
                            start: appConfig.timeWindow.start,
                            end: appConfig.timeWindow.end
                        };
                    }
                    if (appConfig.contactOverrides) {
                        preferences.rules[ruleKey].contactOverrides = { ...appConfig.contactOverrides };
                    }
                }
            });
            console.log('[PREFS] User preferences updated from Settings UI');
            io.emit('preferences_updated', preferences.rules);
        });

        /** EVENT: clear_queue (manual flush from UI) */
        socket.on('clear_queue', async () => {
            await flushQueue(io);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Device Disconnected: ${socket.id}`);
        });
    });
};