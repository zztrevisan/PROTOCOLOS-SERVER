const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

try { process.loadEnvFile('.env'); } catch {}

const raiz = path.resolve(__dirname, '..');
const origem = path.resolve(raiz, process.env.SQLITE_DATABASE_PATH || 'banco/hiperion.db');
const destinoDir = path.resolve(raiz, process.env.SQLITE_BACKUP_DIR || 'banco/backups');
if (!fs.existsSync(origem)) throw new Error(`Banco não encontrado: ${origem}`);
fs.mkdirSync(destinoDir, { recursive: true });

const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
const destino = path.join(destinoDir, `hiperion-backup-${carimbo}.db`);
const db = new DatabaseSync(origem);
try {
  db.exec('PRAGMA wal_checkpoint(FULL)');
  db.exec(`VACUUM INTO '${destino.replaceAll("'", "''")}'`);
} finally {
  db.close();
}

const verificacao = new DatabaseSync(destino, { readOnly: true });
const integridade = verificacao.prepare('PRAGMA integrity_check').get().integrity_check;
verificacao.close();
if (integridade !== 'ok') throw new Error(`Backup criado, mas falhou na integridade: ${integridade}`);
console.log(JSON.stringify({ ok: true, origem, destino, bytes: fs.statSync(destino).size }, null, 2));
