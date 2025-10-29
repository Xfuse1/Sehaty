const crypto = require('crypto');
try {
  const merchant = 'MID-31202-773';
  const order = 'PHYS-1760975018652-08g5p644z';
  const amount = '55.00';
  const currency = 'EGP';
  const secret = 'da7b28cf36566e8bf9e9b29472bf3139$993989d7fe6e174443e48b30c83e8096434d9d03b7516ca3e6b6ff08346e346f771b268e5386fcfea790cc76ee61c928';
  const path = '/?payment=' + merchant + '.' + order + '.' + amount + '.' + currency;
  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'utf8'));
  hmac.update(path);
  const hash = hmac.digest('hex');
  console.log('PATH::', path);
  console.log('HASH::', hash);
} catch (e) {
  console.error('ERROR', e && e.stack ? e.stack : e);
  process.exit(1);
}
