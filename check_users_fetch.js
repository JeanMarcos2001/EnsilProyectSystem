const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});

const URL = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/usuario?select=*`;

async function check() {
  const res = await fetch(URL, {
    method: 'GET',
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  });
  
  const text = await res.text();
  console.log(text);
}

check();
