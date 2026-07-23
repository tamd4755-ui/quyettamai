export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // 2 khóa API từ ảnh của bạn
    const API_KEYS = [
        "AQ.Ab8RN6IBdQiy-R2Y9a0uYr3E4MgcOHdoHJH3zQ7r8KMU9OYdcw",
        "AQ.Ab8RN6LwugzoEtrwh9oE6_4mB01_Gb9bo5wEfm094_hjPGMcBw"
    ];

    let replyText = null;

    for (let key of API_KEYS) {
        try {
            // Sửa đường dẫn chính xác bằng tham số ?key=
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                replyText = data.candidates[0].content.parts[0].text;
                break; // Tìm thấy phản hồi thành công thì thoát ngay vòng lặp
            }
        } catch (err) {
            console.error("Lỗi khi kết nối API:", err);
        }
    }

    if (replyText) {
        return res.status(200).json({ reply: replyText });
    } else {
        return res.status(500).json({ error: "Không thể kết nối Google Gemini. Vui lòng thử lại sau giây lát!" });
    }
}
