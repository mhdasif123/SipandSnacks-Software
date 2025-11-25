require('dotenv').config();

console.log('Checking .env file...\n');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD value:', process.env.DB_PASSWORD ? `"${process.env.DB_PASSWORD}"` : 'NOT SET');
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

if (!process.env.DB_PASSWORD) {
  console.log('\n❌ ERROR: DB_PASSWORD is not set!');
  console.log('Make sure your .env file has: DB_PASSWORD=1234');
} else if (typeof process.env.DB_PASSWORD !== 'string') {
  console.log('\n❌ ERROR: DB_PASSWORD is not a string!');
  console.log('Current type:', typeof process.env.DB_PASSWORD);
} else {
  console.log('\n✓ DB_PASSWORD is set correctly as a string');
}

