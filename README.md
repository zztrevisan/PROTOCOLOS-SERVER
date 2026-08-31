# Hiperion Protocolos

Sistema interno para registrar a emissão, a movimentação e a entrega de documentos da Hiperion Assessoria Contábil.

O fluxo reúne cadastro de empresas, protocolos, etiquetas com QR Code, confirmação de entrega por assinatura e envio de comprovante por e-mail. O acesso é individual e as ações disponíveis variam conforme o perfil do usuário.

## O que o sistema resolve

- identifica os documentos enviados a cada empresa;
- mantém o histórico de emissão, entrega, cancelamento e exclusão;
- gera etiquetas A4 e impressão direta em envelopes;
- confirma a entrega com nome, assinatura e leitura do QR Code;
- envia o comprovante aos e-mails cadastrados da empresa;
- permite operação na nuvem ou em servidor interno.

## Arquitetura

```text
Navegador / PWA
      |
      v
API Express + autenticação e RBAC
      |
      +-- Vercel -> Turso
      |
      +-- Servidor interno -> SQLite
      |
      +-- Resend (comprovante por e-mail)
```

A interface está em `public/`. A versão hospedada usa `server-turso.js`; a instalação interna usa `server.js`. As duas implementações mantêm as mesmas regras de negócio e rotas.

## Segurança

- sessão em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção;
- permissões por perfil para administração, emissão e entrega;
- bloqueio de mutações originadas em outros sites;
- limite de tentativas no login e nas alterações da API;
- senhas derivadas com salt e dados sensíveis mantidos fora do repositório.

## Execução

```bash
npm install
```

Copie `.env.example` para `.env` e preencha somente os valores do ambiente.

```bash
# Vercel/Turso
npm run start:cloud

# Servidor interno/SQLite
npm run start:internal

# Verificação do ambiente interno
npm run verify:internal
```

Outros comandos disponíveis:

```bash
npm run backup:internal
npm run migrate:turso-to-sqlite
```

## Documentação

- [Design System](docs/DESIGN-SYSTEM.md)
- [Arquitetura de software](docs/ARQUITETURA.md)
- [Fluxos do sistema](docs/FLUXOS.md)
- [Manual de implantação interna](docs/IMPLANTACAO-SERVIDOR-INTERNO.md)
- [Checklist da TI](docs/CHECKLIST-TI.md)
- [Padrão de contribuição e commits](CONTRIBUTING.md)

As versões diagramadas estão em [`output/pdf`](output/pdf).

## Estrutura do projeto

```text
public/             interface e recursos da PWA
lib/                integrações compartilhadas
scripts/            manutenção, migração e backup
docs/               documentação técnica
output/pdf/         documentação pronta para apresentação
server-turso.js     aplicação hospedada na Vercel
server.js           aplicação do servidor interno
vercel.json         configuração de publicação
```

## Dados e credenciais

Arquivos `.env`, bancos SQLite, tokens e cópias de produção não devem ser enviados ao GitHub. Use `.env.example` apenas como referência de configuração.
