import { FastifyInstance } from 'fastify';
import { createArtistConnectAccount, processTrackPurchase } from '@harmony/payments';
import { db } from '../db.js';

export async function paymentRoutes(fastify: FastifyInstance) {
  // 1. Create Stripe Connect Onboarding Account Link
  fastify.post('/api/payments/onboard', async (request, reply) => {
    const { artistId, email } = request.body as { artistId: string; email: string };
    if (!artistId || !email) {
      return reply.status(400).send({ error: 'Missing artistId or email' });
    }
    try {
      const onboardUrl = await createArtistConnectAccount(artistId, email, db);
      return { onboardUrl };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Stripe onboarding failed', details: error.message });
    }
  });

  // 2. Process Purchase & Split Revenue
  fastify.post('/api/payments/purchase', async (request, reply) => {
    const { listenerId, artistConnectId, amountInCents } = request.body as {
      listenerId: string;
      artistConnectId: string;
      amountInCents: number;
    };
    if (!listenerId || !artistConnectId || !amountInCents) {
      return reply.status(400).send({ error: 'Missing listenerId, artistConnectId, or amountInCents' });
    }
    try {
      const clientSecret = await processTrackPurchase(listenerId, artistConnectId, amountInCents);
      return { clientSecret };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Purchase processing failed', details: error.message });
    }
  });
}
