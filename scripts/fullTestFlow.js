const axios = require('axios');
const https = require('https');
const crypto = require('crypto');

const agent = new https.Agent({ rejectUnauthorized: false });
const BASE = 'https://localhost:5000';

async function run() {
  try {
    // 1) create order
    const createRes = await axios.post(`${BASE}/api/escrow/bookings/artist/68bde1fbcd2e93059ea312d5/create-order`, { eventDate: '2025-09-20' }, { httpsAgent: agent });
    console.log('create-order status', createRes.status, createRes.data);
    const bookingId = createRes.data.bookingId;
    const order = createRes.data.order;
    if (!bookingId || !order) throw new Error('no booking/order returned');

    // 2) simulate a payment.captured webhook payload
    const payment = {
      id: 'pay_test_' + Date.now(),
      entity: 'payment',
      amount: order.amount,
      currency: order.currency,
      status: 'captured',
      order_id: order.id
    };
    const payload = {
      entity: 'event',
      account_id: 'acct_test',
      event: 'payment.captured',
      payload: { payment: { entity: payment }, order: { entity: order } }
    };

    const raw = JSON.stringify(payload);
    // use RAZORPAY_WEBHOOK_SECRET from env if present; else compute a dummy secret and set it temporarily by calling an admin endpoint? We'll just send without signature to see response.
    const sig = crypto.createHmac('sha256', (process.env.RAZORPAY_WEBHOOK_SECRET || ''))
      .update(raw).digest('hex');

    const whRes = await axios.post(`${BASE}/api/escrow/webhook`, raw, { httpsAgent: agent, headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': sig } });
    console.log('webhook status', whRes.status, whRes.data);

    // 3) fetch booking and show booking.files
    const bRes = await axios.get(`${BASE}/api/escrow/bookings/${bookingId}`, { httpsAgent: agent });
    console.log('booking after webhook', JSON.stringify(bRes.data, null, 2));

    // 4) try to download receipt URL if present
    const url = bRes.data.booking.files && (bRes.data.booking.files.receiptUrl || bRes.data.booking.files.bookingOrgUrl);
    if (!url) {
      console.error('No files URLs found');
      return;
    }
    console.log('attempting to GET', url);
    const dl = await axios.get(url, { httpsAgent: agent, responseType: 'arraybuffer' });
    console.log('downloaded bytes', dl.data && dl.data.byteLength ? dl.data.byteLength : dl.data.length);

  } catch (err) {
    if (err.response) console.error('ERR', err.response.status, err.response.data);
    else console.error(err.message);
  }
}

run();
