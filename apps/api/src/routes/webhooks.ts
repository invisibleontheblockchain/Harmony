import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { db } from '../db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function webhookRoutes(fastify: FastifyInstance) {
  // Stripe webhook — must parse raw body for signature verification
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
      done(null, body);
    }
  );

  fastify.post('/api/webhooks/stripe', async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body as Buffer,
        sig,
        WEBHOOK_SECRET
      );
    } catch (err: any) {
      fastify.log.error('Webhook signature verification failed:', err.message);
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    switch (event.type as string) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        fastify.log.info(`Payment succeeded: ${paymentIntent.id}`);

        // Record the payment in the royalty ledger
        const listenerId = paymentIntent.metadata?.listener_id;
        if (listenerId && paymentIntent.transfer_data?.destination) {
          try {
            await db.query(
              `INSERT INTO royalty_ledger (rights_holder_id, amount_cents, ledger_type, description)
               SELECT rh.id, $1, 'nft_sale', $2
               FROM rights_holders rh
               WHERE rh.stripe_connect_account_id = $3`,
              [
                paymentIntent.amount,
                `Payment ${paymentIntent.id}`,
                paymentIntent.transfer_data.destination,
              ]
            );
          } catch (error: any) {
            fastify.log.error('Failed to record payment in ledger:', error.message);
          }
        }
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        fastify.log.info(`Transfer created: ${transfer.id}`);

        // Update payout batch status if this was a payout transfer
        if (transfer.metadata?.batch_id) {
          try {
            await db.updatePayoutBatchStatus(
              transfer.metadata.batch_id,
              'completed',
              transfer.id
            );
          } catch (error: any) {
            fastify.log.error('Failed to update payout batch:', error.message);
          }
        }
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        fastify.log.warn(`Transfer failed: ${transfer.id}`);

        if (transfer.metadata?.batch_id) {
          try {
            await db.updatePayoutBatchStatus(transfer.metadata.batch_id, 'failed');
          } catch (error: any) {
            fastify.log.error('Failed to update payout batch:', error.message);
          }
        }
        break;
      }

      default:
        fastify.log.info(`Unhandled event type: ${event.type}`);
    }

    return reply.status(200).send({ received: true });
  });
}
