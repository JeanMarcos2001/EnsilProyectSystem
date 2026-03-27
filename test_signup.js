const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});

async function signup() {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY.replace(/\r/g, ''),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'ensil@test.com',
      password: 'admin123'
    })
  });
  
  const data = await res.json();
  console.log("SIGNUP RESPONSE:", data);
}

signup();
