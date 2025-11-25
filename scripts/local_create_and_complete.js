// Local script to create a booking by calling controller directly and then simulate payment capture
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

async function main(){
  try{
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connect-artist';
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { });
    console.log('Connected to MongoDB');

    const paymentsController = require(path.join(__dirname, '..', 'controllers', 'paymentsController'));
    const Booking = require(path.join(__dirname, '..', 'models', 'Booking'));
    const notifyService = require(path.join(__dirname, '..', 'services', 'notifyService'));

    // Fake req/res objects
    const artistId = process.argv[2] || '68bde1fbcd2e93059ea312d5';
    const req = {
      params: { artistId },
      body: {
        eventDate: new Date(Date.now()+24*3600*1000).toISOString().split('T')[0],
        eventTime: '18:00',
        eventLocation: 'Local Test Venue',
        organizerPhone: '+919876543210',
        notes: 'Local create test'
      },
      headers: {},
      cookies: {},
      originalUrl: '/api/escrow/bookings/artist/'+artistId+'/create-order',
      method: 'POST'
    };

    const res = {
      statusCode: 200,
      _body: null,
      status(code){ this.statusCode = code; return this; },
      json(obj){ this._body = obj; console.log('RES.JSON', JSON.stringify(obj, null, 2)); return obj; },
      send(x){ console.log('RES.SEND', x); return x; }
    };

    const outLog = (s) => { try { const p = require('path').join(__dirname, '..', 'logs'); if (!require('fs').existsSync(p)) require('fs').mkdirSync(p,{recursive:true}); require('fs').appendFileSync(require('path').join(p,'local_run_output.log'), new Date().toISOString() + ' ' + s + '\n'); } catch(e){} };
    outLog('Calling createBookingFromArtistAndOrder...');
    await paymentsController.createBookingFromArtistAndOrder(req, res);

    const bookingId = (res._body && res._body.bookingId) || (res._body && res._body.booking && res._body.booking._id);
    if (!bookingId) {
      outLog('No bookingId returned; aborting simulation - res body: ' + JSON.stringify(res._body || {}));
      process.exit(1);
    }

    outLog('Booking created with id ' + bookingId);

    // Fetch booking and simulate capture/verify
    const booking = await Booking.findById(bookingId);
    if (!booking) { console.error('Could not find booking after creation'); process.exit(1); }

    booking.razorpay = booking.razorpay || {};
    booking.razorpay.paymentId = 'LOCAL_SIM_PAYMENT_'+Date.now();
    booking.paymentStatus = 'captured';
    booking.status = 'confirmed';
    await booking.save();
  outLog('Booking updated to captured/confirmed');

    try{
      await notifyService.generatePdfsAndNotify(booking);
      console.log('notifyService completed');
    } catch(e){
      outLog('notifyService error: ' + (e && e.message));
    }

    const updated = await Booking.findById(bookingId).lean();
    outLog('Final booking (files): ' + JSON.stringify((updated.files || {}), null, 2));

    outLog('Test completed successfully');
    process.exit(0);
  } catch (err){
    console.error('Script error', err);
    process.exit(1);
  }
}

main();
