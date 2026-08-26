# Hiperion Protocolos

Sistema interno de emissão, entrega e assinatura de protocolos.

## Execução

- Nuvem/Vercel com Turso: `npm run start:cloud`
- Servidor interno com SQLite: `npm run start:internal`
- Verificação interna: `npm run verify:internal`
- Backup SQLite consistente: `npm run backup:internal`
- Migração Turso → SQLite: `npm run migrate:turso-to-sqlite`

## Implantação interna

O procedimento completo está em:

- [Manual de implantação](docs/IMPLANTACAO-SERVIDOR-INTERNO.md)
- [Checklist da TI](docs/CHECKLIST-TI.md)

Copie `.env.example` para `.env` e nunca envie credenciais ou bancos ao GitHub.
