# Hiperion Protocolos

## Configurações de entrega

O menu **Configurações de entrega** é exclusivo de administradores. Permite desativar a localização, exigir GPS para concluir ou aceitar sua ausência com justificativa de 10 a 1.000 caracteres. Também controla a exigência de QR Code e a alternativa pelo número do protocolo. Nome e assinatura permanecem obrigatórios.

Padrão: GPS desligado, QR ligado e número permitido em emergência. As regras são verificadas pelo servidor; uma mudança vale para confirmações e sincronizações posteriores, não altera entregas já registradas. É necessário estar conectado para consultar as regras ao iniciar a confirmação; se a conexão cair depois, a fila preserva a evidência coletada e o servidor a revalida ao sincronizar.

A localização é capturada somente na conclusão, mediante permissão do navegador e HTTPS (ou localhost). Coordenadas, precisão e horários não comprovam presença de forma absoluta. Administradores consultam o registro em **Protocolos entregues → abrir protocolo → Ver registro de localização**. Dados de GPS não são incluídos no comprovante, no e-mail ou na listagem geral. O link opcional para Google Maps transmite as coordenadas ao provedor apenas quando aberto.

Teste isolado das regras: `node --test tests/delivery-settings.test.cjs`. Não usa o banco operacional.

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




## Licença e uso

Este projeto é um software proprietário desenvolvido por **Guilherme Andrade dos Santos Trevisan**.

A disponibilização deste repositório não significa que o software seja open source. O código-fonte é disponibilizado exclusivamente para fins de portfólio, demonstração, avaliação técnica e apresentação comercial.

É proibido utilizar, copiar, modificar, redistribuir, sublicenciar, revender ou incorporar este código em outros projetos sem autorização expressa do autor. O software pode ser licenciado comercialmente para empresas mediante contrato ou autorização específica. A aquisição de uma licença de uso não transfere a propriedade do código-fonte ou da propriedade intelectual do sistema.

**Copyright © 2026 Guilherme Andrade dos Santos Trevisan. Todos os direitos reservados.**

<details>
<summary><b>Click here for English Version 🇺🇸</b></summary>

<br>

### English
This project is proprietary software developed by **Guilherme Andrade dos Santos Trevisan**.

Making this repository available does not mean that the software is open source. The source code is provided exclusively for portfolio, demonstration, technical evaluation, and commercial presentation purposes.

Using, copying, modifying, redistributing, sublicensing, reselling, or incorporating this code into other projects without express authorization from the author is strictly prohibited. The software may be commercially licensed to companies under a specific contract or agreement. Acquiring a usage license does not transfer ownership of the source code or intellectual property.

**Copyright © 2026 Guilherme Andrade dos Santos Trevisan. All rights reserved.**

</details>

## Retiradas de documentação

Em **Nova solicitação**, todos os perfis podem escolher **Novo protocolo** ou **Nova retirada**. Na lateral, **Acompanhar retiradas** reúne andamento e conferidas, com cartões compactos, busca por empresa/box e GPS conforme configuração. A conferência no escritório continua exclusiva da Legalização e administradores. Consulte [o fluxo e as permissões](docs/retiradas.md).
