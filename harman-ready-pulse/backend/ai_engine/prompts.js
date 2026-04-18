// backend/ai_engine/prompts.js
const { queryEdgeAI } = require('./edge_ai_client');

async function classifyMessageIntent(messageText) {
    const prompt = `Task: Message Classification.
Message: "${messageText}"
Classify this text strictly into exactly ONE of these four strings based on meaning:
- EMERGENCY (Only for actual life-threatening accidents, severe health crises, or literal emergencies).
- OOO (Out of office, auto-replies).
- SPAM (Promotions, marketing, gibberish like 'IHIOUODBK').
- ROUTINE (Standard messages, normal conversations).

If the message is random letters or doesn't make sense, classify it as SPAM or ROUTINE, NOT EMERGENCY.
Output only the single classification string without punctuation or explanation.
Classification:`;
    
    const response = await queryEdgeAI(prompt);
    
    let intent = response.toUpperCase().trim().replace(/[^A-Z]/g, '');
    
    if (intent.includes('EMERGENCY')) intent = 'EMERGENCY';
    else if (intent.includes('OOO')) intent = 'OOO';
    else if (intent.includes('SPAM')) intent = 'SPAM';
    else intent = 'ROUTINE'; // Default fallback

    return intent; 
}

async function summarizeQueue(queueArray) {
    if (queueArray.length === 0) return "No missed messages.";
    
    // Find highest priority WhatsApp message (queueArray is already sorted by priority)
    let topMessage = queueArray.find(m => m.app && m.app.toLowerCase().includes('whatsapp'));
    
    // Fallback if no WhatsApp message
    if (!topMessage) {
        topMessage = queueArray[0];
    }
    
    const remainingCount = queueArray.length - 1;

    const prompt = `Task: Summarize the missed messages.
You are an in-car assistant reading a summary to the driver. 
Top Message: "${topMessage.text}" from "${topMessage.sender}".
Total other missed messages: ${remainingCount}.

Instructions:
1. You must explicitly read out the contents of the top priority message exactly as written but conversationally. 
2. State the number of other missed messages.
3. Be brief, clear, and direct.
4. Do not talk about what you are doing. Just say the summary.

Response:`;
    
    const response = await queryEdgeAI(prompt);
    
    if (response === "ERROR_AI_OFFLINE") {
        return `Network restored. You have a message from ${topMessage.sender} saying '${topMessage.text}'. You also missed ${remainingCount} other routine notifications.`;
    }

    // Stripping any remaining markdown just in case
    return response.replace(/[*#_\[\]]/g, ''); 
}

module.exports = { classifyMessageIntent, summarizeQueue };