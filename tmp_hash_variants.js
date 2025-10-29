const crypto = require('crypto');

const merchant = 'MID-31202-773';
const order = 'PHYS-1760975018652-08g5p644z';
const amounts = ['55.00', '55'];
const customerRefs = ['', 'undefined', 'null', '0', '1'];
const target = '6761ab06ddd253c4cf9a052e814ae7ee223bc7c3983d386a083bf888aeaa6892';

const secret = 'da7b28cf36566e8bf9e9b29472bf3139$993989d7fe6e174443e48b30c83e8096434d9d03b7516ca3e6b6ff08346e346f771b268e5386fcfea790cc76ee61c928';
const apiKey = '6c40bda8-dad9-4f88-aec2-b77fc23e9dac';

function hmac(key, path) {
  return crypto.createHmac('sha256', Buffer.from(key, 'utf8')).update(path).digest('hex');
}

console.log('Target:', target);

for (const keyName of ['secret', 'apiKey']) {
  const key = keyName === 'secret' ? secret : apiKey;
  for (const amt of amounts) {
    for (const cust of customerRefs) {
      const path = `/?payment=${merchant}.${order}.${amt}.EGP${cust ? '.' + cust : ''}`;
      const hash = hmac(key, path);
      const match = hash === target;
      if (match) {
        console.log('MATCH!', keyName, amt, cust || '<none>', path, hash);
      } else {
        console.log(keyName, amt, cust || '<none>', hash, match ? '<MATCH>' : '');
      }
    }
  }
}
