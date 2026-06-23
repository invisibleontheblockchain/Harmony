import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.register(async (f) => {
    await f.register(requireAuth as any);

    f.post('/api/subscriptions/checkout', async (request, reply) => {
      const userId = (request as any).userId;
      const { priceId, tierType } = request.body as { priceId: string; tierType: string };

      const user = await db.query('SELECT email, display_name FROM users WHERE id = $1', [userId]);
      if (!user.length) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: user[0].email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: 'https://harmony.fm/account/subscription?success=true',
        cancel_url: 'https://harmony.fm/account/subscription?canceled=true',
        metadata: { userId, tierType },
      });

      return { sessionUrl: session.url };
    });

    f.get('/api/subscriptions/tiers', async () => {
      const tiers = await db.query(
        "SELECT id, name, description, price_cents, benefits, is_active FROM subscription_tiers WHERE is_active = TRUE ORDER BY price_cents ASC"
      );
      return tiers;
    });

    f.get('/api/studio/fans', async (request) => {
      const userId = (request as any).userId;
      const subs = await db.query(
        `SELECT fs.id, u.display_name AS fan_name, u.avatar_url AS fan_avatar,
                st.name AS tier_name, st.price_cents, fs.status, fs.current_period_end
         FROM fan_subscriptions fs
         JOIN users u ON u.id = fs.fan_id
         JOIN subscription_tiers st ON st.id = fs.tier_id
         WHERE fs.artist_id = $1
         ORDER BY fs.created_at DESC`,
        [userId]
      );
      return subs;
    });
  });
}
