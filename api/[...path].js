export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers',
    'Content-Type, ACCESS-KEY, ACCESS-SIGN, ACCESS-TIMESTAMP, ACCESS-PASSPHRASE, locale');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const targetUrl = 'https://api.bitget.com' + req.url;

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json',
  };
  if (req.headers['access-key']) headers['ACCESS-KEY'] = req.headers['access-key'];
  if (req.headers['access-sign']) headers['ACCESS-SIGN'] = req.headers['access-sign'];
  if (req.headers['access-timestamp']) headers['ACCESS-TIMESTAMP'] = req.headers['access-timestamp'];
  if (req.headers['access-passphrase']) headers['ACCESS-PASSPHRASE'] = req.headers['access-passphrase'];
  if (req.headers['locale']) headers['locale'] = req.headers['locale'];

  try {
    const fetchOpts = { method: req.method, headers };
    if (req.method === 'POST' && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    const response = await fetch(targetUrl, fetchOpts);
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
