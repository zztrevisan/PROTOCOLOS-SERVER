const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

try { process.loadEnvFile('.env'); } catch {}

const raiz = path.resolve(__dirname, '..');
const destino = path.resolve(raiz, process.env.MIGRATION_SQLITE_PATH || 'banco/hiperion-interno-migracao.db');
const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
if (!url || !authToken) throw new Error('TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios.');
if (fs.existsSync(destino)) throw new Error(`Migração cancelada: o destino já existe e não será sobrescrito: ${destino}`);

const serializar = valor => typeof valor === 'bigint' ? Number(valor) : valor;

async function executar() {
  const { connect } = await import('@tursodatabase/serverless');
  const remoto = connect({ url, authToken });
  const tabelasPermitidas = ['usuarios', 'clientes', 'protocolos', 'protocolo_itens', 'sessoes'];
  const estruturas = await remoto.all(`
    SELECT type, name, tbl_name, sql
    FROM sqlite_master
    WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
    ORDER BY CASE type WHEN 'table' THEN 1 WHEN 'index' THEN 2 ELSE 3 END, name
  `);
  const tabelas = estruturas.filter(item=>item.type==='table'&&tabelasPermitidas.includes(item.name));
  if (tabelas.length !== tabelasPermitidas.length) {
    throw new Error(`Estrutura inesperada no Turso. Encontradas: ${tabelas.map(t=>t.name).join(', ')}`);
  }

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const local = new DatabaseSync(destino);
  const relatorio = { origem: 'Turso', destino, tabelas: {} };
  try {
    local.exec('PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;');
    for (const tabela of tabelas) local.exec(tabela.sql);
    for (const tabela of tabelas) {
      const colunas = (await remoto.all(`PRAGMA table_info(${tabela.name})`)).map(c=>c.name);
      // Sessões antigas não são transportadas: todos devem autenticar novamente após a virada.
      const registros = tabela.name === 'sessoes' ? [] : await remoto.all(`SELECT * FROM ${tabela.name} ORDER BY id`);
      const marcadores = colunas.map(()=>'?').join(', ');
      const inserir = local.prepare(`INSERT INTO ${tabela.name} (${colunas.join(', ')}) VALUES (${marcadores})`);
      for (const registro of registros) inserir.run(...colunas.map(c=>serializar(registro[c]) ?? null));
      const totalLocal = Number(local.prepare(`SELECT COUNT(*) AS total FROM ${tabela.name}`).get().total);
      if (totalLocal !== registros.length) throw new Error(`Contagem divergente em ${tabela.name}.`);
      relatorio.tabelas[tabela.name] = totalLocal;
    }
    for (const item of estruturas.filter(i=>i.type==='index'&&tabelasPermitidas.includes(i.tbl_name))) local.exec(item.sql);
    local.exec('COMMIT; PRAGMA foreign_keys = ON;');
    const fk = local.prepare('PRAGMA foreign_key_check').all();
    const integridade = local.prepare('PRAGMA integrity_check').get().integrity_check;
    if (fk.length || integridade !== 'ok') throw new Error(`Validação SQLite falhou: integridade=${integridade}, FKs=${fk.length}.`);
  } catch (erro) {
    try { local.exec('ROLLBACK'); } catch {}
    throw erro;
  } finally {
    local.close();
  }

  const relatorioPath = `${destino}.relatorio.json`;
  fs.writeFileSync(relatorioPath, JSON.stringify({ ...relatorio, concluido_em: new Date().toISOString() }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ ok: true, destino, relatorio: relatorioPath, tabelas: relatorio.tabelas }, null, 2));
}

executar().catch(erro=>{ console.error(`MIGRAÇÃO CANCELADA: ${erro.message}`); process.exitCode=1; });
