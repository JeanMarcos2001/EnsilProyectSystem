import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmeHJ0b2hta3Bya2tvYXFlY3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc4MzIzMSwiZXhwIjoyMDg5MzU5MjMxfQ.xn31KutXHxHrgmawSoK5nWSht4CcqeiEsXx27kj51lU";

const env = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const idx = line.indexOf('=');
    if (idx !== -1) {
      const key = line.substring(0, idx).trim();
      const val = line.substring(idx + 1).trim();
      acc[key] = val;
    }
    return acc;
  }, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seed() {
  console.log("Iniciando Seed de la BD Remota...");
  
  // 1. Crear Roles
  const { data: roles, error: err1 } = await supabase.from('rol').upsert([
    { nombre: 'Superadmin', descripcion: 'Acceso total', estado: true, permisos: {} },
    { nombre: 'Asesor', descripcion: 'Ventas y matrículas', estado: true, permisos: {} }
  ]).select();
  if (err1) throw new Error("Error rol: " + JSON.stringify(err1));
  const superadminId = roles.find(r => r.nombre === 'Superadmin').id;

  // 2. Crear Filial
  const { data: filiales, error: err2 } = await supabase.from('filial').upsert([
    { nombre: 'Sede Central Lima', ruc: '20123456789', direccion: 'Av. Arequipa 123', estado: 'activo' }
  ]).select();
  if (err2) throw new Error("Error filial: " + JSON.stringify(err2));
  const filialId = filiales[0].id;

  // 3. Crear Auth User Administrador
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@ensil.edu.pe',
    password: 'admin123',
    email_confirm: true 
  });
  
  if (authError && authError.code !== 'user_already_exists') {
    throw new Error("Error Auth User: " + JSON.stringify(authError));
  }

  const { data: usersData } = await supabase.auth.admin.listUsers();
  const adminAuthId = usersData.users.find(u => u.email === 'admin@ensil.edu.pe').id;

  // 4. Crear Perfil
  const { error: errProf } = await supabase.from('usuario_perfil').upsert({
    id: adminAuthId,
    rol_id: superadminId,
    nombre_completo: 'Super Administrador',
    email: 'admin@ensil.edu.pe',
    estado: true
  });
  if (errProf) throw new Error("Error Perfil: " + JSON.stringify(errProf));

  const { data: ufExist } = await supabase.from('usuario_filial').select('*').eq('usuario_id', adminAuthId);
  if (!ufExist || ufExist.length === 0) {
    const { error: errUF } = await supabase.from('usuario_filial').insert({
      usuario_id: adminAuthId,
      filial_id: filialId
    });
    if (errUF) throw new Error("Error UF: " + JSON.stringify(errUF));
  }

  // 5. Académico
  const { data: programas, error: errProg } = await supabase.from('programa').upsert([
    { nombre: 'Kids', descripcion: 'Lectura para niños', color: '#10b981', estado: 'activo' },
    { nombre: 'Especialización', descripcion: 'Lectura ágil y comprensión', color: '#3b82f6', estado: 'activo' }
  ], { onConflict: 'nombre' }).select();
  if (errProg) throw new Error("Error Prog: " + JSON.stringify(errProg));
  
  const kidsId = programas.find(p => p.nombre === 'Kids').id;
  const espId = programas.find(p => p.nombre === 'Especialización').id;

  const { data: niveles, error: errNiv } = await supabase.from('nivel').upsert([
    { programa_id: kidsId, nombre: 'Nivel 1', matricula_incluida: true, orden: 1, estado: 'activo' },
    { programa_id: espId, nombre: 'Básico', matricula_incluida: true, orden: 1, estado: 'activo' }
  ], { onConflict: 'programa_id, nombre' }).select();
  if (errNiv) throw new Error("Error Niveles: " + JSON.stringify(errNiv));

  // 6. Comercial
  const { data: tPagos, error: errTp } = await supabase.from('tipo_pago').upsert([
    { nombre: 'Contado', cantidad_cuotas: 1, estado: 'activo' },
    { nombre: 'Plan 6 Cuotas', cantidad_cuotas: 6, estado: 'activo' }
  ], { onConflict: 'nombre' }).select();
  if (errTp) throw new Error("Error Tipospago: " + JSON.stringify(errTp));

  // 7. Origen Lead
  const { error: errOL } = await supabase.from('origen_lead').upsert([
    { nombre: 'Facebook Ads', estado: 'activo' },
    { nombre: 'Referido', estado: 'activo' }
  ], { onConflict: 'nombre' });
  if (errOL) throw new Error("Error OL: " + JSON.stringify(errOL));

  // 8. Tarifarios
  await supabase.from('tarifario').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: errTar } = await supabase.from('tarifario').insert([
    {
      programa_id: kidsId,
      nivel_id: niveles.find(n => n.nombre === 'Nivel 1').id,
      tipo_pago_id: tPagos.find(t => t.nombre === 'Contado').id,
      moneda: 'PEN',
      costo_matricula: 0,
      costo_total: 800,
      costo_cuota: 800,
      vigencia_desde: new Date().toISOString(),
      vigencia_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
      estado: 'activo'
    },
    {
      programa_id: espId,
      nivel_id: niveles.find(n => n.nombre === 'Básico').id,
      tipo_pago_id: tPagos.find(t => t.nombre === 'Plan 6 Cuotas').id,
      moneda: 'PEN',
      costo_matricula: 150,
      costo_total: 2100,
      costo_cuota: 350,
      vigencia_desde: new Date().toISOString(),
      vigencia_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
      estado: 'activo'
    }
  ]);
  if (errTar) throw new Error("Error Tarifario: " + JSON.stringify(errTar));

  console.log("¡Seed exitoso! Credenciales listas:");
  console.log("Email: admin@ensil.edu.pe");
  console.log("Password: admin123");
}

seed().catch(err => {
  console.error("!!!FATAL ERROR!!!", err.message);
  process.exit(1);
});
