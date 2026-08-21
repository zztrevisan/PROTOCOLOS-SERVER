const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

// ========================================
// CONFIGURAÇÃO DO BANCO
// ========================================

const bancoDir = path.join(__dirname);
const bancoPath = path.join(
  bancoDir,
  'hiperion.db'
);

if (!fs.existsSync(bancoDir)) {
  fs.mkdirSync(
    bancoDir,
    { recursive: true }
  );
}

const db = new DatabaseSync(bancoPath);

// ========================================
// CONFIGURAÇÕES DO SQLITE
// ========================================

// Melhora o funcionamento do SQLite
// quando houver várias operações próximas.
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

// ========================================
// TABELAS PRINCIPAIS
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    departamento TEXT NOT NULL,
    perfil TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS protocolos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER NOT NULL UNIQUE,
    cliente TEXT NOT NULL,
    departamento TEXT NOT NULL,

    -- Mantidos para compatibilidade
    -- com protocolos antigos.
    descricao TEXT NOT NULL,
    vencimento TEXT,

    emissor TEXT NOT NULL,
    entregador TEXT NOT NULL,
    observacao TEXT,

    status TEXT NOT NULL
      DEFAULT 'Aguardando entrega',

    recebido_por TEXT,
    assinatura TEXT,

    criado_em TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    entregue_em TEXT
  );
`);

// ========================================
// FUNÇÃO DE MIGRAÇÃO
// ========================================

function adicionarColunaSeNaoExistir(
  tabela,
  coluna,
  definicao
) {

  const colunas = db
    .prepare(
      `PRAGMA table_info(${tabela})`
    )
    .all();

  const existe = colunas.some(
    c => c.name === coluna
  );

  if (!existe) {

    db.exec(`
      ALTER TABLE ${tabela}
      ADD COLUMN ${coluna} ${definicao}
    `);

    console.log(
      `Banco atualizado: ${tabela}.${coluna}`
    );
  }
}

// ========================================
// CAMPOS DE CANCELAMENTO
// ========================================

adicionarColunaSeNaoExistir(
  'protocolos',
  'motivo_cancelamento',
  'TEXT'
);

adicionarColunaSeNaoExistir(
  'protocolos',
  'cancelado_por',
  'TEXT'
);

adicionarColunaSeNaoExistir(
  'protocolos',
  'cancelado_em',
  'TEXT'
);

// ========================================
// CAMPOS DE EXCLUSÃO LÓGICA
// ========================================

adicionarColunaSeNaoExistir(
  'protocolos',
  'excluido',
  'INTEGER NOT NULL DEFAULT 0'
);

adicionarColunaSeNaoExistir(
  'protocolos',
  'excluido_em',
  'TEXT'
);

adicionarColunaSeNaoExistir(
  'protocolos',
  'excluido_por',
  'TEXT'
);

// ========================================
// LOGIN E SENHAS
// ========================================

adicionarColunaSeNaoExistir(
  'usuarios',
  'usuario',
  'TEXT'
);

adicionarColunaSeNaoExistir(
  'usuarios',
  'senha_hash',
  'TEXT'
);

adicionarColunaSeNaoExistir(
  'usuarios',
  'senha_salt',
  'TEXT'
);

adicionarColunaSeNaoExistir(
  'usuarios',
  'ultimo_login',
  'TEXT'
);

// Evita dois usuários com
// o mesmo nome de login.
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS
  idx_usuarios_login
  ON usuarios(usuario)
  WHERE usuario IS NOT NULL;
`);

// ========================================
// SESSÕES
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    usuario_id INTEGER NOT NULL,

    criado_em TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    expira_em TEXT NOT NULL,

    FOREIGN KEY(usuario_id)
      REFERENCES usuarios(id)
  );
`);

// ========================================
// ITENS / DOCUMENTOS DOS PROTOCOLOS
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS protocolo_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    protocolo_id INTEGER NOT NULL,

    descricao TEXT NOT NULL,

    vencimento TEXT,

    ordem INTEGER NOT NULL DEFAULT 1,

    criado_em TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(protocolo_id)
      REFERENCES protocolos(id)
      ON DELETE CASCADE
  );
`);

// Índice para deixar rápida a busca
// dos documentos de cada protocolo.
db.exec(`
  CREATE INDEX IF NOT EXISTS
  idx_protocolo_itens_protocolo
  ON protocolo_itens(protocolo_id);
`);

// ========================================
// MIGRAÇÃO DOS PROTOCOLOS ANTIGOS
// ========================================
//
// Protocolos que já existiam antes da
// criação de protocolo_itens ganham
// automaticamente um item.
//
// NÃO altera nem apaga o protocolo antigo.
// ========================================

const protocolosAntigos = db
  .prepare(`
    SELECT
      p.id,
      p.descricao,
      p.vencimento
    FROM protocolos p
    WHERE NOT EXISTS (
      SELECT 1
      FROM protocolo_itens pi
      WHERE pi.protocolo_id = p.id
    )
  `)
  .all();

const inserirItemAntigo = db
  .prepare(`
    INSERT INTO protocolo_itens (
      protocolo_id,
      descricao,
      vencimento,
      ordem
    )
    VALUES (?, ?, ?, ?)
  `);

for (const protocolo of protocolosAntigos) {

  if (
    protocolo.descricao &&
    protocolo.descricao.trim()
  ) {

    inserirItemAntigo.run(
      protocolo.id,
      protocolo.descricao.trim(),
      protocolo.vencimento || null,
      1
    );
  }
}

// ========================================
// INFORMAÇÃO DE INICIALIZAÇÃO
// ========================================

console.log(
  'Banco Hiperion inicializado.'
);

if (protocolosAntigos.length > 0) {
  console.log(
    `${protocolosAntigos.length} protocolo(s) antigo(s) verificado(s) para migração de itens.`
  );
}

// ========================================
// EXPORTAÇÃO
// ========================================

module.exports = db;