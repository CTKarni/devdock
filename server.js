const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/contact', async (req, res) => {
  try {
    // Dynamically import the Vercel serverless function (which uses ESM)
    const contactModule = await import('./api/contact.js');
    const handler = contactModule.default;
    
    // Mock the Vercel response object
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
        return vercelRes;
      }
    };
    
    await handler(req, vercelRes);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Serverless function execution failed.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`STARK_SYS DEV SERVER STARTED`);
  console.log(`Access Portal: http://localhost:${PORT}`);
  console.log('==================================================');
});
