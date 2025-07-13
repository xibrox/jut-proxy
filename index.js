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
    const upstreamRes = await fetch(url, {
      headers: {
        'Referer': 'https://jut.su/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Range': range,
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,*/*;q=0.5',
      },
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      return res.status(upstreamRes.status).send(`Upstream error: ${upstreamRes.statusText}`);
    }

    // Copy headers
    res.status(upstreamRes.status);
    for (const [key, value] of upstreamRes.headers.entries()) {
      res.setHeader(key, value);
    }

    // Pipe the stream
    upstreamRes.body.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy server error');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});
