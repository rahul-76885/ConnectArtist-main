/**
 * Notes Parser Utility
 * Extracts structured data from pipe-separated booking notes
 *
 * Format: "Key: value | Key2: value2 | ..."
 */

function parseBookingNotes(notesString) {
  if (!notesString || typeof notesString !== 'string') {
    return {};
  }

  const parsed = {};
  const pairs = notesString.split('|').map(s => s.trim()).filter(s => s.length > 0);

  pairs.forEach(pair => {
    const colonIndex = pair.indexOf(':');
    if (colonIndex === -1) return;

    const key = pair.substring(0, colonIndex).trim();
    const value = pair.substring(colonIndex + 1).trim();

    if (!key || !value) return;

    switch(key) {
      case 'Event Type':
        parsed.eventType = value;
        break;

      case 'Audience Size':
        parsed.audienceSize = value;
        break;

      case 'End Time':
        parsed.endTime = value;
        break;

      case 'Backup Contact':
        parsed.backupContact = value;
        break;

      case 'Number of Sets':
        parsed.numberOfSets = value;
        break;

      case 'Set Duration':
        parsed.setDuration = value;
        break;

      case 'Load-in Time':
        parsed.loadInTime = value;
        break;

      case 'Soundcheck Time':
        parsed.soundcheckTime = value;
        break;

      case 'Technical Requirements':
        // Split by comma and trim each item
        parsed.technicalRider = value.split(',').map(s => s.trim()).filter(s => s);
        break;

      case 'Stage Size':
        parsed.stageSize = value;
        break;

      case 'Technical Notes':
        parsed.technicalNotes = value;
        break;

      case 'Travel Responsibility':
        parsed.travelResponsibility = value.charAt(0).toUpperCase() + value.slice(1);
        break;

      case 'Accommodation Provided':
        // Extract hotel name from "Yes (Hotel Name)" format
        const hotelMatch = value.match(/Yes\s*\((.*?)\)/i);
        if (hotelMatch) {
          parsed.hotelName = hotelMatch[1].trim();
          parsed.accommodationProvided = true;
        } else if (value.toLowerCase().startsWith('yes')) {
          parsed.accommodationProvided = true;
          parsed.hotelName = 'Provided';
        } else {
          parsed.accommodationProvided = false;
          parsed.hotelName = null;
        }
        break;

      case 'Travel Allowance':
        // Remove currency symbols and clean up
        parsed.travelAllowance = value.replace(/[₹$€£]/g, '').trim();
        break;

      case 'Additional Notes':
      case 'User Notes':
        parsed.additionalNotes = value;
        break;

      case 'Terms & Conditions Accepted':
        // Extract version like "v1.0" or "version 1.0"
        const versionMatch = value.match(/v(?:ersion)?\s*([\d.]+)/i);
        parsed.termsVersion = versionMatch ? versionMatch[1] : '1.0';
        parsed.termsAccepted = value.toLowerCase().includes('yes');
        break;

      case 'Cancellation Policy Accepted':
        parsed.cancellationAccepted = value.toLowerCase().includes('yes');
        break;

      case 'Deposit Amount':
        parsed.depositAmount = value.replace(/[₹$€£,]/g, '').trim();
        break;

      case 'Deposit Due Date':
        parsed.depositDueDate = value;
        break;

      default:
        // Store any unrecognized keys in a custom fields object
        if (!parsed.customFields) {
          parsed.customFields = {};
        }
        parsed.customFields[key] = value;
    }
  });

  return parsed;
}

/**
 * Format parsed notes back to human-readable text for display
 */
function formatNotesForDisplay(parsed) {
  const lines = [];

  if (parsed.eventType) lines.push(`Event Type: ${parsed.eventType}`);
  if (parsed.audienceSize) lines.push(`Audience: ${parsed.audienceSize} people`);
  if (parsed.endTime) lines.push(`End Time: ${parsed.endTime}`);
  if (parsed.backupContact) lines.push(`Backup Contact: ${parsed.backupContact}`);

  if (parsed.numberOfSets && parsed.setDuration) {
    lines.push(`Performance: ${parsed.numberOfSets} sets × ${parsed.setDuration}`);
  }

  if (parsed.loadInTime) lines.push(`Load-in: ${parsed.loadInTime}`);
  if (parsed.soundcheckTime) lines.push(`Soundcheck: ${parsed.soundcheckTime}`);

  if (parsed.technicalRider && parsed.technicalRider.length > 0) {
    lines.push(`Technical: ${parsed.technicalRider.join(', ')}`);
  }

  if (parsed.stageSize) lines.push(`Stage: ${parsed.stageSize}`);

  if (parsed.travelResponsibility) {
    lines.push(`Travel: ${parsed.travelResponsibility}`);
  }

  if (parsed.hotelName) {
    lines.push(`Hotel: ${parsed.hotelName}`);
  }

  if (parsed.additionalNotes) {
    lines.push(`Notes: ${parsed.additionalNotes}`);
  }

  return lines.join('\n');
}

/**
 * Get a fallback value for missing data
 */
function getDefaultValue(field, booking) {
  const defaults = {
    eventType: 'Live Performance',
    audienceSize: 'Not specified',
    loadInTime: '2 hours before start',
    soundcheckTime: '1 hour before start',
    numberOfSets: '1',
    setDuration: 'TBD',
    stageSize: 'Standard stage',
    travelResponsibility: 'To be determined',
    technicalRider: ['PA System', 'Monitors', 'Basic Lighting']
  };

  return defaults[field] || 'N/A';
}

module.exports = {
  parseBookingNotes,
  formatNotesForDisplay,
  getDefaultValue
};
