import { FastifyRequest, FastifyReply } from 'fastify';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export async function rateLimit(req: FastifyRequest, reply: FastifyReply, options: RateLimitOptions = {}) {
  const limit = options.limit || (req.authenticated ? 1000 : 100);
  const windowMs = options.windowMs || 60_000;

  const ip = req.ip || 'unknown';
  const key = `${ip}:${req.authenticated ? 'auth' : 'anon'}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  record.count += 1;

  if (record.count > limit) {
    reply.header('Retry-After', Math.ceil((record.resetAt - now) / 1000));
    return reply.status(429).send({ error: 'Rate limit exceeded', retryAfter: Math.ceil((record.resetAt - now) / 1000) });
  }
}

export async function rateLimitPlugin(fastify: import('fastify').FastifyInstance) {
  fastify.addHook('onRequest', async (req, reply) => {
    await rateLimit(req, reply);
  });
}
