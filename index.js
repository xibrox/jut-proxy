// index.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxy', async (req, res) => {
  const url = req.query.url;

  if (!url || !url.startsWith('https://')) {
    return res.status(400).send('Invalid or missing url');
  }

  const range = req.headers.range || 'bytes=0-';

  try {
    const upstream = await fetch(url, {
      headers: {
        'Referer': 'https://jut.su/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Range': range,
        'Accept':
          'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
      },
    });

    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status).send(`Upstream error: ${upstream.statusText}`);
    }

    res.status(upstream.status);
    upstream.headers.forEach((val, key) => res.setHeader(key, val));
    upstream.body.pipe(res);
  } catch (e) {
    console.error('Proxy error:', e);
    res.status(500).send('Proxy failed');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on http://localhost:${PORT}`);
});
