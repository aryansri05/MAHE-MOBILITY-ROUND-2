const { checkEmergencyIntent, summarizeQueue } = require('./prompts');

const mockQueue = [
    { sender: "Mom", text: "Are you coming for dinner tonight?" },
    { sender: "Boss", text: "Did you send the Q3 report? We need it now." },
    { sender: "Unknown", text: "Your Amazon package is out for delivery." },
    { sender: "Wife", text: "Can you pick up milk on the way home?" }
];

async function runTest() {
    console.log("🔥 Waking up edge AI...");
    
    console.log("\n--- Testing Emergency Gatekeeper ---");
    const isEmergency = await checkEmergencyIntent("Help, I just got into a car accident and need an ambulance!");
    console.log(`Emergency Detected (Should be true): ${isEmergency}`);

    const isSpam = await checkEmergencyIntent("Get 20% off your next Uber ride!");
    console.log(`Emergency Detected (Should be false): ${isSpam}`);

    console.log("\n--- Testing Queue Summarizer ---");
    const summary = await summarizeQueue(mockQueue);
    console.log(`\nSummary Output:\n"${summary}"`);
}

runTest();