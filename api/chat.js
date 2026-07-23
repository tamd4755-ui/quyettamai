export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // 2 khóa API dạng AQ... của bạn
    const API_KEYS = [
        "AQ.Ab8RN6KGHFsr6hE9bidFF-rv_EKr24ZrrEJOJhbPYBeHLpuR7w",
        "AQ.Ab8RN6LSP5AoTL3vKtLXYQVo2v2nEz5cCtKLkeMB6Tl2w8hmgw"
    ];

    let data = null;
    let success = false;

    for (let i = 0; i < API_KEYS.length; i++) {
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEYS[i]}`
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });
            data = await response.json();
            if (data.candidates && data.candidates[0]) {
                success = true;
                break;
            }
        } catch (err) {}
    }

    if (success && data.candidates && data.candidates[0].content) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
        return res.status(500).json({ error: "Không thể kết nối Google Gemini. Vui lòng kiểm tra lại khóa API." });
    }
}
