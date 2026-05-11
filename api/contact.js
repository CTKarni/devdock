const BLOCKED_DOMAINS = [
  'mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com',
  'throwaway.email','yopmail.com','fakeinbox.com','trashmail.com',
  'dispostable.com','sharklasers.com','spamgourmet.com','maildrop.cc',
  'getairmail.com','spamfree24.org','mailnull.com','spamhere.com',
  'filzmail.com','spam4.me','binkmail.com','bob.email'
];

const FAKE_EMAILS = [
  'test@test.com','hello@gmail.com','test@gmail.com','admin@admin.com',
  'fake@fake.com','user@user.com','abc@abc.com','example@example.com',
  'test@yahoo.com','hello@yahoo.com','dummy@gmail.com','noone@gmail.com'
];

const FAKE_NAMES = [
  'test','hello','asdf','qwerty','admin','user',
  'abc','xyz','fake','dummy','null','none','na','n/a'
];

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(lower)) return false;
  if (FAKE_EMAILS.includes(lower)) return false;
  const domain = lower.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain)) return false;
  const local = lower.split('@')[0];
  if (local.length < 3) return false;
  return true;
}

function isValidPhone(phone) {
  if (!phone) return false;
  const digits = phone.toString().replace(/[\s\-\+]/g, '');
  if (!/^\d+$/.test(digits)) return false;
  if (digits.length === 10) return true;
  if (digits.length === 12 && digits.startsWith('91')) return true;
  return false;
}

function isValidName(name) {
  if (!name || name.length < 3) return false;
  if (FAKE_NAMES.includes(name.toLowerCase().trim())) return false;
  if (/^[^a-zA-Z]+$/.test(name)) return false;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = '8681756478:AAHBM6s3qUcW141FDp_TnC-itCOn1doSvz8';
  const CHAT_ID   = '6304223359';

  try {
    const {
      name, email, phone, college,
      branch, year, title, description,
      projectType, plan, contactTime,
      honeypot
    } = req.body;

    // Honeypot check — silent fake success for bots
    if (honeypot && honeypot.trim() !== '') {
      return res.status(200).json({ success: true });
    }

    // Required fields
    if (!name || !email || !phone || !title) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Validations
    if (!isValidName(name))  return res.status(400).json({ error: 'Invalid name provided.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid or disposable email address.' });
    if (!isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone number.' });
    if (title.length < 5)    return res.status(400).json({ error: 'Project title too short.' });

    // Build message
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
      return res.status(500).json({ error: 'Failed to send notification.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}