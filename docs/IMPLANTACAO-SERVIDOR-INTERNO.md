# Hiperion Protocolos — implantação no servidor interno

## 1. Arquitetura recomendada

```text
Usuários na LAN/VPN -> HTTPS 443 -> IIS/Nginx -> 127.0.0.1:3000 -> Node.js -> SQLite local
```

O processo Node e o banco devem permanecer no servidor. O arquivo SQLite não deve ficar no OneDrive, em pasta de usuário ou compartilhamento de rede.

## 2. Pré-requisitos

- Servidor Windows ou Linux mantido pela TI e ligado continuamente.
- Node.js corporativo com suporte ao módulo nativo `node:sqlite`.
- Git, se as atualizações forem feitas pelo repositório.
- DNS interno, por exemplo `protocolos.hiperion.local`.
- Certificado HTTPS confiável nos computadores e celulares corporativos.
- Proxy reverso IIS ou Nginx.
- Diretório persistente e protegido para aplicação, banco, logs e backups.

## 3. Instalação de homologação

```powershell
git clone https://github.com/zztrevisan/PROTOCOLOS-SERVER.git
Set-Location PROTOCOLOS-SERVER
npm ci --omit=dev
Copy-Item .env.example .env
```

Editar `.env` sem enviá-lo ao GitHub:

```dotenv
HOST=127.0.0.1
PORT=3000
TRUST_PROXY=1
NODE_ENV=production
SQLITE_DATABASE_PATH=D:/HiperionDados/hiperion.db
SQLITE_BACKUP_DIR=D:/HiperionBackups
```

Criar as pastas de dados e conceder ao usuário do serviço somente as permissões necessárias. Não conceder acesso de gravação aos usuários finais.

## 4. Migração Turso para SQLite

1. Gerar um token Turso temporário e colocá-lo no `.env` do servidor de homologação.
2. Definir um destino novo; o script nunca sobrescreve um arquivo existente.
3. Executar:

```powershell
$env:MIGRATION_SQLITE_PATH='D:/HiperionMigracao/hiperion-interno-migracao.db'
npm run migrate:turso-to-sqlite
```

O script copia usuários, empresas, protocolos e itens; recria a estrutura e índices; valida contagens, integridade e chaves estrangeiras. Sessões não são copiadas, portanto todos fazem login novamente. Um relatório JSON é criado ao lado do banco.

Após validação, configurar `SQLITE_DATABASE_PATH` para a cópia homologada. Não renomear nem substituir o banco de produção com o serviço em execução.

## 5. Validação antes da virada

```powershell
npm run verify:internal
npm run start:internal
```

Em outro terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/health
```

Validar manualmente:

- Login do administrador geral e da Legalização.
- Quantidade de usuários, empresas, protocolos e itens contra o relatório.
- Próximo número de protocolo.
- Pesquisa por nome e box.
- Empresas inativas fora da emissão.
- Criação, entrega, assinatura, impressão e exclusão de um protocolo de teste.
- Acesso por computador e celular no Wi-Fi corporativo.

## 6. Proxy e firewall

- Expor aos usuários somente HTTPS na porta 443.
- Manter Node em `127.0.0.1:3000`.
- Redirecionar HTTP para HTTPS.
- Encaminhar `Host`, `X-Forwarded-Proto` e IP de origem.
- Não publicar a porta 3000 na LAN ou internet.
- Fora da empresa, permitir somente por VPN, salvo aprovação formal de segurança.

O endpoint `/health` é público, não retorna dados empresariais e pode ser usado pelo monitoramento.

## 7. Serviço automático

Registrar `npm run start:internal` como serviço aprovado pela TI (serviço Windows/NSSM/PM2, systemd ou contêiner). Configurar:

- Diretório de trabalho igual à raiz do projeto.
- Variáveis de ambiente ou `.env` protegido.
- Reinício automático em falha.
- Inicialização junto com o sistema.
- Logs com rotação e monitoramento.

## 8. Backup

Executar diariamente:

```powershell
npm run backup:internal
```

A rotina faz checkpoint do WAL, cria uma cópia consistente com `VACUUM INTO` e executa `integrity_check`. Depois, a TI deve copiar o backup para outro equipamento/armazenamento, criptografar e aplicar retenção.

Sugestão: 30 diários, 12 mensais e teste trimestral de restauração. Não considerar backup válido sem teste de restauração.

## 9. Virada definitiva

1. Avisar os usuários e bloquear novas operações no ambiente Vercel.
2. Fazer exportação final do Turso.
3. Executar a migração em arquivo novo.
4. Comparar relatório e testar o banco final.
5. Parar o serviço interno, apontar `SQLITE_DATABASE_PATH` para o banco final e iniciar novamente.
6. Validar `/health` e o roteiro funcional.
7. Divulgar o DNS interno.
8. Manter Vercel/Turso somente leitura ou preservado durante o período de contingência.
9. Revogar o token temporário do Turso.

Nunca permitir escrita simultânea na Vercel/Turso e no SQLite interno depois da virada.

## 10. Atualização e rollback

Antes de atualizar:

```powershell
npm run backup:internal
git status --short
git pull --ff-only origin main
npm ci --omit=dev
npm run verify:internal
```

Reiniciar o serviço e validar `/health`. Registrar o hash do commit implantado. Em falha, parar o serviço, retornar ao commit previamente aprovado e restaurar o backup somente se houve alteração incompatível no banco.

## 11. Responsabilidades

- TI: servidor, sistema operacional, DNS, HTTPS, firewall, serviço, logs, backup e restauração.
- Responsável do sistema: homologação funcional, usuários, permissões e autorização da virada.
- Desenvolvimento: código, scripts de migração, correções e instruções de atualização.
