import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers',
    'Content-Type, X-BG-KEY, X-BG-SECRET, X-BG-PASS');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = req.headers['x-bg-key'];
  const apiSecret = req.headers['x-bg-secret'];
  const apiPass = req.headers['x-bg-pass'];

  if (!apiKey || !apiSecret || !apiPass) {
    return res.status(400).json({ error: 'Missing API credentials in headers' });
  }

  const targetPath = req.url;
  const timestamp = Date.now().toString();
  const method = req.method.toUpperCase();
  const body = req.method === 'POST' && req.body
    ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
    : '';

  const signStr = timestamp + method + targetPath + body;
  const sign = crypto.createHmac('sha256', apiSecret).update(signStr).digest('base64');

  const headers = {
    'Content-Type': 'application/json',
    'ACCESS-KEY': apiKey,
    'ACCESS-SIGN': sign,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-PASSPHRASE': apiPass,
    'locale': 'en-US',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  const targetUrl = 'https://api.bitget.com' + targetPath;

  try {
    const fetchOpts = { method, headers };
    if (body) fetchOpts.body = body;
    const response = await fetch(targetUrl, fetchOpts);
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
