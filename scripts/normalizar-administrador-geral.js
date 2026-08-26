const path = require('path');
const raiz = path.resolve(__dirname, '..');

async function executar() {
  process.loadEnvFile(path.join(raiz, '.env'));
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken) throw new Error('Credenciais do Turso ausentes.');

  const { connect } = await import('@tursodatabase/serverless');
  const db = connect({ url, authToken });
  const administradores = await db.all(`
    SELECT id, nome, usuario, departamento, perfil, ativo
    FROM usuarios
    WHERE perfil = 'admin'
    ORDER BY id
  `);
  const contaPrincipal = await db.get(`
    SELECT id, nome, usuario, departamento, perfil, ativo
    FROM usuarios
    WHERE LOWER(TRIM(COALESCE(usuario, ''))) = 'admin'
      AND perfil = 'admin'
      AND ativo = 1
    LIMIT 1
  `);

  if (!contaPrincipal) {
    throw new Error('A conta principal ativa não está configurada como Administrador geral.');
  }

  console.log(JSON.stringify({
    ok: true,
    alterados: [],
    contaPrincipal,
    administradoresGerais: administradores
  }, null, 2));
}

executar().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
