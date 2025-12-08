const axios = require('axios');

const EMAIL = 'awnish.singh723dm@gmail.com';
const PASSWORD = 'rehaan_Vd@7870';

const BACKEND_URL = 'http://localhost:3001/api/v1/auth/login';
const FRONTEND_PROXY_URL = 'http://localhost:3000/api/v1/auth/login';

async function testLogin(url, label) {
  console.log(`\n--- Testing ${label} ---`);
  console.log(`URL: ${url}`);
  try {
    const response = await axios.post(url, {
      email: EMAIL,
      password: PASSWORD
    });
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data sample:', JSON.stringify(response.data).substring(0, 100));
  } catch (error) {
    console.log('❌ Failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function run() {
  await testLogin(BACKEND_URL, 'DIRECT BACKEND (3001)');
  await testLogin(FRONTEND_PROXY_URL, 'FRONTEND PROXY (3000)');
}

run();
