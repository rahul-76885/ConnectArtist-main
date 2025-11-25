/**
 * Test Premium PDF Generation
 *
 * This script tests the new premium PDF templates with sample data
 * Run: node scripts/test_premium_pdf.js
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const { generateBookingPDF } = require('../services/pdfGenerator');

// Sample booking data with full notes field
const sampleBooking = {
  _id: new mongoose.Types.ObjectId(),
  artistId: new mongoose.Types.ObjectId(),
  artistName: 'Rahul Sharma',
  artistEmail: 'rahul.sharma@example.com',
  artistPhone: '+91 98765 43210',
  artistGenre: 'Classical Fusion',
  organizerName: 'Priya Patel',
  organizerEmail: 'priya.patel@example.com',
  organizerPhone: '+91 87654 32109',
  eventDate: new Date('2025-12-25'),
  startTime: '19:00',
  venue: 'Grand Ballroom, Taj Palace Hotel, Mumbai, Maharashtra 400001',
  price: 75000,
  paymentStatus: 'captured',
  notes: 'Event Type: Wedding Reception | Audience Size: 500 | End Time: 23:00 | Backup Contact: John Fernandes - +91 99887 76655 | Number of Sets: 2 | Set Duration: 45 minutes | Load-in Time: 17:00 | Soundcheck Time: 18:00 | Technical Requirements: PA System, Wireless Microphones, Stage Monitors, LED Stage Lights, Backdrop Screen | Stage Size: 10m x 8m | Travel Responsibility: Organizer | Accommodation Provided: Yes (Taj Hotel - Presidential Suite) | Travel Allowance: ₹5000 | Additional Notes: Bride loves Sufi music. Please prepare 3-4 romantic songs. Dinner provided for artist and crew. | Terms & Conditions Accepted: Yes (v1.2)',
  createdAt: new Date(),
  updatedAt: new Date()
};

async function testPDFGeneration() {
  console.log('🎨 Testing Premium PDF Generation...\n');
  console.log('Sample Booking Data:');
  console.log('- Booking ID:', sampleBooking._id.toString());
  console.log('- Artist:', sampleBooking.artistName);
  console.log('- Organizer:', sampleBooking.organizerName);
  console.log('- Event Date:', sampleBooking.eventDate.toLocaleDateString());
  console.log('- Venue:', sampleBooking.venue);
  console.log('- Amount: ₹', sampleBooking.price.toLocaleString('en-IN'));
  console.log('- Payment Status:', sampleBooking.paymentStatus);
  console.log('\n');

  try {
    // Test Organizer PDF
    console.log('📄 Generating Organizer Confirmation PDF...');
    const orgPDF = await generateBookingPDF(sampleBooking, 'org');
    const orgFilePath = path.join(__dirname, '..', 'test_organizer_premium.pdf');
    fs.writeFileSync(orgFilePath, orgPDF);
    console.log('✅ Organizer PDF generated successfully!');
    console.log(`   File: ${orgFilePath}`);
    console.log(`   Size: ${(orgPDF.length / 1024).toFixed(2)} KB\n`);

    // Test Artist PDF
    console.log('🎸 Generating Artist Itinerary PDF...');
    const artistPDF = await generateBookingPDF(sampleBooking, 'artist');
    const artistFilePath = path.join(__dirname, '..', 'test_artist_premium.pdf');
    fs.writeFileSync(artistFilePath, artistPDF);
    console.log('✅ Artist PDF generated successfully!');
    console.log(`   File: ${artistFilePath}`);
    console.log(`   Size: ${(artistPDF.length / 1024).toFixed(2)} KB\n`);

    console.log('🎉 All PDFs generated successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open the generated PDFs to visually inspect them');
    console.log('2. Check that all data displays correctly');
    console.log('3. Verify QR codes are scannable');
    console.log('4. Ensure fonts and colors render properly');
    console.log('5. Test printing to check page breaks\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating PDFs:', error);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
console.log('═══════════════════════════════════════════════');
console.log('  Premium PDF Generation Test');
console.log('═══════════════════════════════════════════════\n');

testPDFGeneration();
