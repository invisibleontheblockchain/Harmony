import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/fastify';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Extend Fastify request to include authenticated user info
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    sessionId?: string;
  }
}

/**
 * Clerk authentication plugin for Fastify.
 * Verifies the Bearer token from the Authorization header
 * and attaches userId/sessionId to the request.
 */
export async function clerkAuthPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      request.userId = payload.sub;
      request.sessionId = payload.sid as string;
    } catch (error: any) {
      fastify.log.error('Auth verification failed:', error.message);
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });
}

/**
 * Hook that can be applied per-route or globally to require authentication.
 * Usage: { preHandler: [requireAuth] }
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Authentication required' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    request.userId = payload.sub;
    request.sessionId = payload.sid as string;
  } catch (error: any) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}
