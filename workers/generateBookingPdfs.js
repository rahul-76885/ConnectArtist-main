/**
 * generateBookingPdfs.js
 *
 * Usage:
 *   node workers/generateBookingPdfs.js ./sample-payload.json
 *
 * This script:
 * - loads sample-payload.json (booking object)
 * - renders booking-confirmation.html and artist-contact.html with Mustache
 * - generates a QR code (dataURI) for verification link
 * - calls Puppeteer to render HTML -> PDF (A4)
 * - writes files to ./output/
 *
 * Replace uploadToCloud() with your GCS/S3 implementation and return remote URL.
 */

const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');

async function readTemplate(name) {
  const tpath = path.join(__dirname, '..', 'templates', name);
  return fs.readFile(tpath, 'utf8');
}

async function generateQrDataUri(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 300 });
}

async function inlineImageAsDataUri(url) {
  // Simple inlining helper. Fetch remote URL and convert to data URI
  // For production, use node-fetch and handle errors.
  try {
    const fetch = require('node-fetch');
    const res = await fetch(url);
    if (!res.ok) return url;
    const buf = await res.buffer();
    const mime = res.headers.get('content-type') || 'image/jpeg';
    const base = buf.toString('base64');
    return `data:${mime};base64,${base}`;
  } catch (err) {
    console.warn('inlineImageAsDataUri failed, falling back to original url', err.message || err);
    return url;
  }
}

async function uploadToCloud(localPath, destFilename) {
  // TODO: Replace with your upload logic to GCS/S3 and return public URL
  // Example: upload to GCS -> return signed or public URL
  // For now, we simply return localPath
  return 'file://' + path.resolve(localPath);
}

async function renderPdfFromHtml(html, outPath) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();

  // Set content and wait for network idle
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait a moment to allow webfonts/images to load
  await new Promise(resolve => setTimeout(resolve, 500));

  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '18mm', right: '18mm' },
  });

  await browser.close();
  return outPath;
}

async function main() {
  try {
    const arg = process.argv[2] || './sample-payload.json';
    const payload = await fs.readJson(path.resolve(arg));

    // prepare variables for templates
    payload.generatedAt = (new Date()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    payload.qrUrl = `https://yourdomain.example/verify/${payload.bookingId}`;
    const qrDataUri = await generateQrDataUri(payload.qrUrl);

    // inline artist photo for reliability in PDF
    payload.artist.photoUrl = payload.artist.photoUrl
      ? await inlineImageAsDataUri(payload.artist.photoUrl)
      : '';

    // inline logo and brand background if URLs provided
    payload.logoUrl = payload.logoUrl ? await inlineImageAsDataUri(payload.logoUrl) : '';
    payload.brandBackgroundUrl = payload.brandBackgroundUrl ? await inlineImageAsDataUri(payload.brandBackgroundUrl) : '';
    payload.qrDataUri = qrDataUri;

    // Ensure arrays exist
    payload.attachments = payload.attachments || [];

    // Calculate balance
    payload.payment.balance = payload.payment.price - payload.payment.paid;

    // Render templates
    const bookingTpl = await readTemplate('booking-confirmation.html');
    const artistTpl = await readTemplate('artist-contact.html');

    // Mustache: allow functions (e.g., uppercase) — add small helper if needed
    const view = payload;

    const bookingHtml = mustache.render(bookingTpl, view);
    const artistHtml = mustache.render(artistTpl, view);

    // Output paths
    const outDir = path.join(__dirname, '..', 'output');
    await fs.ensureDir(outDir);
    const orgPdfPath = path.join(outDir, `booking_${payload.bookingId}_organizer.pdf`);
    const artistPdfPath = path.join(outDir, `booking_${payload.bookingId}_artist.pdf`);

    console.log('Rendering organizer PDF to', orgPdfPath);
    await renderPdfFromHtml(bookingHtml, orgPdfPath);

    console.log('Rendering artist PDF to', artistPdfPath);
    await renderPdfFromHtml(artistHtml, artistPdfPath);

    // Optional: upload to cloud and set booking.files.* accordingly
    const orgUrl = await uploadToCloud(orgPdfPath, path.basename(orgPdfPath));
    const artistUrl = await uploadToCloud(artistPdfPath, path.basename(artistPdfPath));

    console.log('Generated PDFs:', { orgPdfPath, artistPdfPath, orgUrl, artistUrl });

    // TODO: update booking record in DB with orgUrl and artistUrl and pdf metadata (checksum, generatedAt)
    // Example: await Booking.updateOne({ _id: payload.bookingId }, { $set: { 'files.bookingOrgUrl': orgUrl, 'files.bookingArtistUrl': artistUrl, pdfGeneratedAt: new Date() } });

    process.exit(0);
  } catch (err) {
    console.error('PDF generation failed', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

main();
