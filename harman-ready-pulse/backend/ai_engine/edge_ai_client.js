// backend/ai_engine/edge_ai_client.js

async function queryEdgeAI(promptText) {
    const startTime = Date.now(); 

    try {
const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'phi3', 
        prompt: promptText,
        stream: false,
        options: {
            num_predict: 100,      // BUMP THIS to 100 to prevent mid-sentence cut-offs
            temperature: 0.1,      // LOWER THIS to 0.1 for maximum factual accuracy
            stop: ["\n", "Summary:", "Messages:"] // ADD STOP SEQUENCES to kill the output early
        }
    })
});

        const data = await response.json();
        const latency = Date.now() - startTime;
        
        console.log(`[Edge AI - Phi-3] Response in ${latency}ms`);
        return data.response.trim();
        
    } catch (error) {
        console.error("[Edge AI Offline]:", error);
        return "ERROR_AI_OFFLINE";
    }
}

module.exports = { queryEdgeAI };