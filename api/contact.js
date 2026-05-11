export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = '8681756478:AAHBM6s3qUcW141FDp_TnC-itCOn1doSvz8';
  const CHAT_ID   = '6304223359';

  try {
    const {
      name, email, phone, college,
      branch, year, title, description,
      projectType, plan, contactTime
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build the Telegram message
    const message = `
🔔 *New Project Request — TheDevDock*

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}
🏫 *College:* ${college || 'Not provided'}

🎓 *Branch:* ${branch || 'Not provided'}
📅 *Year:* ${year || 'Not provided'}

📌 *Project Title:* ${title}
🛠 *Type:* ${projectType || 'Not specified'}
💰 *Plan:* ${plan || 'Not decided'}
🕐 *Best Time to Call:* ${contactTime || 'Not specified'}

📝 *Description:*
${description || 'No description provided'}
    `.trim();

    // Send to Telegram
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      console.error('Telegram error:', telegramData);
      return res.status(500).json({ error: 'Failed to send Telegram message' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}