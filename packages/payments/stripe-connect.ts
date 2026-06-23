const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createArtistConnectAccount(artistId, email) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  
  await db.query('UPDATE artists SET stripe_connect_id = $1 WHERE id = $2', [
    account.id, 
    artistId
  ]);
  
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://harmony.app/onboarding/refresh',
    return_url: 'https://harmony.app/onboarding/complete',
    type: 'account_onboarding',
  });
  
  return accountLink.url;
}

async function processTrackPurchase(listenerId, artistConnectId, amountInCents) {
  const platformFee = Math.floor(amountInCents * 0.15);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    transfer_data: { destination: artistConnectId },
    application_fee_amount: platformFee,
  });
  
  return paymentIntent.client_secret;
}