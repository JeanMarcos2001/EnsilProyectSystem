import { createClient } from '@supabase/supabase-js';

const URL = "https://lfxrtohmkprkkoaqecqj.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmeHJ0b2hta3Bya2tvYXFlY3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc4MzIzMSwiZXhwIjoyMDg5MzU5MjMxfQ.xn31KutXHxHrgmawSoK5nWSht4CcqeiEsXx27kj51lU";

const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log("--- Fase 1: Estructura Base ---");

  // 1. Roles
  console.log("Creando Roles...");
  const { data: roles, error: err1 } = await supabase.from('rol').upsert([
    { nombre: 'Superadmin', descripcion: 'Acceso total', estado: true, permisos: {} },
    { nombre: 'Asesor', descripcion: 'Ventas y matrículas', estado: true, permisos: {} }
  ]).select();
  if (err1) throw new Error("Error rol: " + JSON.stringify(err1));
  console.log("Roles creados:", roles.length);

  const superadminId = roles.find(r => r.nombre === 'Superadmin').id;

  // 2. Filial
  console.log("Creando Filial...");
  const { data: filiales, error: err2 } = await supabase.from('filial').upsert([
    { nombre: 'Sede Central Lima', ruc: '20123456789', direccion: 'Av. Arequipa 123', estado: 'activo' }
  ]).select();
  if (err2) throw new Error("Error filial: " + JSON.stringify(err2));
  console.log("Filial creada:", filiales[0].nombre);

  const filialId = filiales[0].id;

  // 3. Admin User
  console.log("Creando Auth Admin...");
  const { data: userData } = await supabase.auth.admin.listUsers();
  let admin = userData.users.find(u => u.email === 'admin@ensil.edu.pe');

  if (!admin) {
    const { data: newAdmin, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@ensil.edu.pe',
      password: 'admin123',
      email_confirm: true 
    });
    if (authError) throw new Error("Error Auth User: " + JSON.stringify(authError));
    admin = newAdmin.user;
    console.log("Admin Auth creado.");
  } else {
    console.log("Admin Auth ya existía.");
  }

  // 4. Perfil
  console.log("Actualizando Perfil...");
  const { error: errProf } = await supabase.from('usuario_perfil').upsert({
    id: admin.id,
    rol_id: superadminId,
    nombre_completo: 'Super Administrador',
    email: 'admin@ensil.edu.pe',
    estado: true
  });
  if (errProf) throw new Error("Error Perfil: " + JSON.stringify(errProf));

  // 5. Vincular a sede
  const { data: ufExist } = await supabase.from('usuario_filial').select('*').eq('usuario_id', admin.id);
  if (ufExist.length === 0) {
    await supabase.from('usuario_filial').insert({
      usuario_id: admin.id,
      filial_id: filialId
    });
    console.log("Vínculo a sede creado.");
  }

  console.log("Fase 1 Completada con éxito.");
}

run().catch(err => {
  console.error("Error FATAL:", err.message);
  process.exit(1);
});
