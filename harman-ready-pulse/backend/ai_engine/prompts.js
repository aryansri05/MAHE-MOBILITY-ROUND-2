const { queryEdgeAI } = require('./edge_ai_client');

async function checkEmergencyIntent(messageText) {
    const prompt = `Task: Classify intent.
Message: "${messageText}"
Is this a life-threatening or medical emergency? 
Answer ONLY: TRUE or FALSE
Answer:`;
    
    const response = await queryEdgeAI(prompt);
    return response.toUpperCase().includes('TRUE'); 
}

async function summarizeQueue(queueArray) {
    const rawText = queueArray.map(msg => `From ${msg.sender}: ${msg.text}`).join(' | ');
    
    const prompt = `You are a car's AI assistant. Summarize these messages into ONE concise paragraph (max 2 sentences). 
Focus on the most important updates. Do not use lists.

Messages: ${rawText}
Summary:`;
    
    return await queryEdgeAI(prompt);
}

module.exports = { checkEmergencyIntent, summarizeQueue };