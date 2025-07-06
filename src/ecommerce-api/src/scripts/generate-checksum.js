const crypto = require('crypto');

const payload = {
  orderCode: 1717416591000,
  status: 'PAID',
  amount: 1100,
  description: 'DH#1717416591000'
};

const checksumKey = 'f59c853445eb79aa8b25ece7b14816b084fc3d0c9df2185f5b31c467db8a9b59'; // 👈 thay bằng PAYOS_CHECKSUM_KEY trong .env

const sortedPayload = Object.keys(payload)
  .sort()
  .map(key => `${key}=${payload[key]}`)
  .join('&');

const checksum = crypto
  .createHmac('sha256', checksumKey)
  .update(sortedPayload)
  .digest('hex');

console.log('✅ x-checksum:', checksum);
