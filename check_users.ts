import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkUsers() {
  const { data, error } = await supabase
    .from('usuario')
    .select('id, email, estado');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Usuarios en BD:', JSON.stringify(data, null, 2));
  }
}

checkUsers();
