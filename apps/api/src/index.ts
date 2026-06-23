import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { clerkAuthPlugin } from './auth.js';
import { trackRoutes } from './routes/tracks.js';
import { paymentRoutes } from './routes/payments.js';
import { recommendationRoutes } from './routes/recommendations.js';
import { webhookRoutes } from './routes/webhooks.js';
import { libraryRoutes } from './routes/library.js';
import { notificationRoutes } from './routes/notifications.js';
import { daoRoutes } from './routes/dao.js';
import { payoutRoutes } from './routes/payouts.js';
import { subscriptionRoutes } from './routes/subscriptions.js';
import { tipRoutes } from './routes/tips.js';
import { dmcaRoutes } from './routes/dmca.js';
import { rateLimitPlugin } from './middleware/rate-limit.js';

dotenv.config();

const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' },
});

fastify.register(cors, {
  origin: true,
});

fastify.register(rateLimitPlugin);

await fastify.register(clerkAuthPlugin);

// Register route groups
await fastify.register(trackRoutes);
await fastify.register(paymentRoutes);
await fastify.register(recommendationRoutes);
await fastify.register(webhookRoutes);
await fastify.register(libraryRoutes);
await fastify.register(notificationRoutes);
await fastify.register(daoRoutes);
await fastify.register(payoutRoutes);
await fastify.register(subscriptionRoutes);
await fastify.register(tipRoutes);
await fastify.register(dmcaRoutes);

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
