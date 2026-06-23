export default {
  async fetch(request: any, env: any) {
    const url = new URL(request.url);
    const trackId = url.searchParams.get("track_id");
    const listenerId = url.searchParams.get("listener_id");
    const timestamp = Date.now();
    const dedupKey = `stream:${listenerId}:${trackId}`;
    
    const lastStream = await env.STREAM_KV.get(dedupKey);
    if (!lastStream || (timestamp - parseInt(lastStream)) > 30000) {
      await env.STREAM_KV.put(dedupKey, timestamp.toString(), { expirationTtl: 60 });
      const event = { trackId, listenerId, timestamp, duration: 30 };
      await env.STREAM_QUEUE.send(event);
    }
    return new Response("Stream recorded", { status: 200 });
  }
}