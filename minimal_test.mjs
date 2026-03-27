import { createClient } from '@supabase/supabase-js';

const URL = "https://lfxrtohmkprkkoaqecqj.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmeHJ0b2hta3Bya2tvYXFlY3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc4MzIzMSwiZXhwIjoyMDg5MzU5MjMxfQ.xn31KutXHxHrgmawSoK5nWSht4CcqeiEsXx27kj51lU";

const supabase = createClient(URL, KEY);

async function test() {
  console.log("Probando conexión...");
  const { data, error } = await supabase.from('rol').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Éxito:", data);
  }
}

test();
