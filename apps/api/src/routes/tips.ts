import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function tipRoutes(fastify: FastifyInstance) {
  fastify.register(async (f) => {
    await f.register(requireAuth as any);

    f.post('/api/tips', async (request, reply) => {
      const userId = (request as any).userId;
      const { recipientArtistId, amountCents, message } = request.body as {
        recipientArtistId: string;
        amountCents: number;
        message?: string;
      };

      if (!recipientArtistId || !amountCents || amountCents < 100) {
        return reply.status(400).send({ error: 'Minimum tip is $1.00' });
      }

      const recipient = await db.query(
        'SELECT stripe_connect_account_id FROM rights_holders WHERE user_id = $1',
        [recipientArtistId]
      );
      if (!recipient.length || !recipient[0].stripe_connect_account_id) {
        return reply.status(400).send({ error: 'Recipient not set up for payouts' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        transfer_data: { destination: recipient[0].stripe_connect_account_id },
        application_fee_amount: Math.floor(amountCents * 0.08),
        metadata: { sender_id: userId, recipient_id: recipientArtistId, type: 'tip' },
      });

      await db.query(
        `INSERT INTO royalty_ledger (rights_holder_id, amount_cents, ledger_type, description)
         VALUES ($1, $2, 'tip', $3)`,
        [recipientArtistId, Math.floor(amountCents * 0.92), `Tip from ${userId}${message ? ': ' + message : ''}`]
      );

      return { clientSecret: paymentIntent.client_secret };
    });
  });
}
