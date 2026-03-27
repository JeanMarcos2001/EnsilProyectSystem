require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUsers() {
  const { data, error } = await supabase
    .from('usuario')
    .select('id, email, estado, roles:rol_id(nombre)');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Usuarios en BD:', JSON.stringify(data, null, 2));
  }
}

checkUsers();
