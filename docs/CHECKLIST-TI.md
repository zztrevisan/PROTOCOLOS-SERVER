# Checklist de entrega para a TI

## Infraestrutura

- [ ] Servidor/VM definido e com responsável.
- [ ] Node.js compatível instalado.
- [ ] Diretórios de aplicação, dados, logs e backups separados.
- [ ] Usuário de serviço sem privilégios administrativos desnecessários.
- [ ] DNS interno criado.
- [ ] HTTPS válido configurado.
- [ ] Porta 443 liberada; porta 3000 restrita ao localhost.
- [ ] VPN definida para acesso externo, se necessário.

## Dados

- [ ] Token temporário do Turso criado.
- [ ] Migração de homologação executada em arquivo novo.
- [ ] Relatório de contagens aprovado.
- [ ] `PRAGMA integrity_check` aprovado.
- [ ] Teste de restauração de backup realizado.
- [ ] Janela de virada definitiva agendada.
- [ ] Token temporário revogado após a virada.

## Aplicação

- [ ] `.env` protegido e fora do Git.
- [ ] `npm run verify:internal` aprovado.
- [ ] Serviço automático configurado.
- [ ] Reinício automático testado.
- [ ] `/health` monitorado.
- [ ] Login, permissões, emissão, entrega, assinatura e impressão homologados.
- [ ] Acesso móvel pelo Wi-Fi/VPN homologado.

## Operação

- [ ] Backup diário agendado.
- [ ] Retenção e cópia externa configuradas.
- [ ] Rotação de logs configurada.
- [ ] Procedimento de atualização documentado.
- [ ] Commit implantado registrado.
- [ ] Responsáveis por incidente e restauração definidos.
