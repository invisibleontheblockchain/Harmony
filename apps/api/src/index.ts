import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { clerkAuthPlugin } from './auth.js';
import { trackRoutes } from './routes/tracks.js';
import { paymentRoutes } from './routes/payments.js';
import { recommendationRoutes } from './routes/recommendations.js';
import { webhookRoutes } from './routes/webhooks.js';

dotenv.config();

const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' },
});

fastify.register(cors, {
  origin: true,
});

// Register Clerk authentication plugin
await fastify.register(clerkAuthPlugin);

// Register route groups
await fastify.register(trackRoutes);
await fastify.register(paymentRoutes);
await fastify.register(recommendationRoutes);
await fastify.register(webhookRoutes);

// Health check (public)
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
