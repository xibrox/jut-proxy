// app/api/proxy/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl || !videoUrl.startsWith('https://')) {
    return new Response('Missing or invalid video URL', { status: 400 });
  }

  const range = req.headers.get('range') || 'bytes=0-';

  try {
    const upstreamRes = await fetch(videoUrl, {
      headers: {
        'Referer': 'https://jut.su/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Range': range,
        'Accept':
          'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
      },
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      return new Response(`Upstream error: ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    const headers = new Headers();
    upstreamRes.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers,
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response('Proxy server error', { status: 500 });
  }
}
