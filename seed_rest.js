const URL = "https://lfxrtohmkprkkoaqecqj.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmeHJ0b2hta3Bya2tvYXFlY3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc4MzIzMSwiZXhwIjoyMDg5MzU5MjMxfQ.xn31KutXHxHrgmawSoK5nWSht4CcqeiEsXx27kj51lU";

async function req(path, method = 'GET', body = null, conflict = null) {
  let finalPath = path;
  const headers = {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  if (conflict) {
    headers['Prefer'] = 'return=representation,resolution=merge-duplicates';
    const separator = finalPath.includes('?') ? '&' : '?';
    finalPath += `${separator}on_conflict=${conflict}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${URL}${finalPath}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch(e) {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Error en ${finalPath}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  console.log("--- Seed REST Upsert (Corrected) ---");

  // 1. Roles
  console.log("Upsert Roles...");
  await req('/rest/v1/rol', 'POST', [
    { nombre: 'Superadmin', descripcion: 'Acceso total', estado: true, permisos: {} },
    { nombre: 'Asesor', descripcion: 'Ventas y matrículas', estado: true, permisos: {} }
  ], 'nombre');
  
  const rRef = await req('/rest/v1/rol?select=id,nombre');
  const superadminId = rRef.find(r => r.nombre === 'Superadmin').id;
  console.log("Roles OK.");

  // 2. Filial
  console.log("Upsert Filial...");
  await req('/rest/v1/filial', 'POST', [
    { nombre: 'Sede Central Lima', ruc: '20123456789', direccion: 'Av. Arequipa 123', estado: 'activo' }
  ], 'nombre');
  const fRef = await req('/rest/v1/filial?select=id,nombre');
  const filialId = fRef[0].id;
  console.log("Filial OK.");

  // 3. Auth User
  console.log("Auth Admin check...");
  const authListRes = await fetch(`${URL}/auth/v1/admin/users`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  });
  const authListData = await authListRes.json();
  let admin = authListData.users.find(u => u.email === 'admin@ensil.edu.pe');
  let adminId;

  if (!admin) {
    const createRes = await fetch(`${URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ensil.edu.pe', password: 'admin123', email_confirm: true })
    });
    const createData = await createRes.json();
    adminId = createData.id;
    console.log("User Auth Creado.");
  } else {
    adminId = admin.id;
    console.log("User Auth Ya existía.");
  }

  // 4. Perfil
  console.log("Upsert Perfil...");
  await req('/rest/v1/usuario_perfil', 'POST', {
    id: adminId,
    rol_id: superadminId,
    nombre_completo: 'Super Administrador',
    email: 'admin@ensil.edu.pe',
    estado: true
  }, 'id');

  // 5. Vincular
  console.log("Vínculo Filial...");
  // usuario_filial usa usuario_id, filial_id como PK o unique?
  // Probaremos sin conflict o con usuario_id si es 1:1 para este test
  await req('/rest/v1/usuario_filial', 'POST', {
    usuario_id: adminId,
    filial_id: filialId
  }, 'usuario_id,filial_id');

  // --- FASE 2: Académico ---
  console.log("Upsert Programas...");
  await req('/rest/v1/programa', 'POST', [
    { nombre: 'Kids', descripcion: 'Lectura para niños', color: '#10b981', estado: 'activo' },
    { nombre: 'Especialización', descripcion: 'Lectura ágil y comprensión', color: '#3b82f6', estado: 'activo' }
  ], 'nombre');
  const pRef = await req('/rest/v1/programa?select=id,nombre');
  const kidsId = pRef.find(p => p.nombre === 'Kids').id;
  const espId = pRef.find(p => p.nombre === 'Especialización').id;

  console.log("Upsert Niveles...");
  await req('/rest/v1/nivel', 'POST', [
    { programa_id: kidsId, nombre: 'Nivel 1', matricula_incluida: true, orden: 1, estado: 'activo' },
    { programa_id: espId, nombre: 'Básico', matricula_incluida: true, orden: 1, estado: 'activo' }
  ], 'programa_id,nombre');
  const nRef = await req('/rest/v1/nivel?select=id,nombre');

  // --- FASE 3: Comercial ---
  console.log("Upsert Comercial...");
  await req('/rest/v1/tipo_pago', 'POST', [
    { nombre: 'Contado', cantidad_cuotas: 1, estado: 'activo' },
    { nombre: 'Plan 6 Cuotas', cantidad_cuotas: 6, estado: 'activo' }
  ], 'nombre');
  const tpRef = await req('/rest/v1/tipo_pago?select=id,nombre');

  await req('/rest/v1/origen_lead', 'POST', [
    { nombre: 'Facebook Ads', estado: 'activo' },
    { nombre: 'Referido', estado: 'activo' }
  ], 'nombre');

  // 8. Tarifarios
  console.log("Insertando Tarifarios...");
  const tExist = await req('/rest/v1/tarifario?select=id');
  if (tExist.length === 0) {
    await req('/rest/v1/tarifario', 'POST', [
      {
        programa_id: kidsId,
        nivel_id: nRef.find(n => n.nombre === 'Nivel 1').id,
        tipo_pago_id: tpRef.find(t => t.nombre === 'Contado').id,
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
        nivel_id: nRef.find(n => n.nombre === 'Básico').id,
        tipo_pago_id: tpRef.find(t => t.nombre === 'Plan 6 Cuotas').id,
        moneda: 'PEN',
        costo_matricula: 150,
        costo_total: 2100,
        costo_cuota: 350,
        vigencia_desde: new Date().toISOString(),
        vigencia_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
        estado: 'activo'
      }
    ]);
  }

  console.log("SEED COMPLETADO CON ÉXITO.");
}

run().catch(e => console.error(e));
