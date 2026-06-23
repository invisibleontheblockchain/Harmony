import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface DatabaseClient {
  query(text: string, params?: any[]): Promise<any[]>;
}

export async function createArtistConnectAccount(
  artistId: string,
  email: string,
  db: DatabaseClient
): Promise<string> {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  await db.query(
    'UPDATE rights_holders SET stripe_connect_account_id = $1 WHERE user_id = $2',
    [account.id, artistId]
  );

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://harmony.app/onboarding/refresh',
    return_url: 'https://harmony.app/onboarding/complete',
    type: 'account_onboarding',
  });

  return accountLink.url;
}

export async function processTrackPurchase(
  listenerId: string,
  artistConnectId: string,
  amountInCents: number
): Promise<string> {
  const platformFee = Math.floor(amountInCents * 0.15);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    transfer_data: { destination: artistConnectId },
    application_fee_amount: platformFee,
    metadata: { listener_id: listenerId },
  });

  return paymentIntent.client_secret!;
}