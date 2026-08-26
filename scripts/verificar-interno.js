const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

try { process.loadEnvFile('.env'); } catch {}

const raiz = path.resolve(__dirname, '..');
const relativo = process.env.SQLITE_DATABASE_PATH || 'banco/hiperion.db';
const bancoPath = path.resolve(raiz, relativo);
const erros = [];

if (!fs.existsSync(bancoPath)) erros.push(`Banco não encontrado: ${bancoPath}`);
if (process.env.NODE_ENV !== 'production') erros.push('NODE_ENV deve ser production.');
if (process.env.TRUST_PROXY !== '1') erros.push('TRUST_PROXY deve ser 1 quando houver proxy HTTPS.');
if (!Number.isInteger(Number(process.env.PORT || 3000))) erros.push('PORT inválida.');

let contagens = {};
if (fs.existsSync(bancoPath)) {
  const db = new DatabaseSync(bancoPath, { readOnly: true });
  try {
    const integridade = db.prepare('PRAGMA integrity_check').get();
    if (integridade.integrity_check !== 'ok') erros.push(`SQLite integrity_check: ${integridade.integrity_check}`);
    for (const tabela of ['usuarios', 'clientes', 'protocolos', 'protocolo_itens']) {
      contagens[tabela] = Number(db.prepare(`SELECT COUNT(*) AS total FROM ${tabela}`).get().total);
    }
  } finally {
    db.close();
  }
}

const resultado = {
  ok: erros.length === 0,
  node: process.version,
  banco: bancoPath,
  contagens,
  erros
};
console.log(JSON.stringify(resultado, null, 2));
if (erros.length) process.exitCode = 1;
