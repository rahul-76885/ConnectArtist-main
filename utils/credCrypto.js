const crypto = require('crypto');
const key = (process.env.CRED_ENCRYPTION_KEY || 'replace_with_strong_key_32_chars').slice(0,32);
const ivLen = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(ivLen);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

function decrypt(cipherText) {
  const parts = cipherText.split(':');
  if (parts.length !== 2) throw new Error('Invalid cipher text format');
  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let dec = decipher.update(encrypted, 'base64', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = { encrypt, decrypt };
