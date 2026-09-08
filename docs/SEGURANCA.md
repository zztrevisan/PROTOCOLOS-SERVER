# Segurança

## Controles aplicados

- sessões em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção;
- senhas derivadas com salt e sem armazenamento reversível;
- autorização por perfil e departamento aplicada no servidor;
- validação de origem nas operações que alteram dados;
- limitação de tentativas no login e nas rotas de escrita;
- cabeçalhos contra framing, sniffing e vazamento de referência;
- segredos fornecidos por variáveis de ambiente;
- GPS visível integralmente apenas para administradores.

## Dados sensíveis

Assinaturas, coordenadas, credenciais e dados de clientes exigem acesso restrito. Bancos SQLite, arquivos WAL, backups, `.env`, tokens e logs com dados pessoais não devem ser versionados nem enviados a canais públicos.

O GPS é evidência auxiliar. A precisão depende do aparelho e não comprova presença de forma absoluta. O sistema registra horário, precisão e método usado, mas não expõe coordenadas em e-mails ou listagens gerais.

## E-mail

O remetente deve usar domínio autorizado pelo provedor. Falha de envio não desfaz uma entrega ou coleta já registrada; o resultado do envio fica associado à operação para diagnóstico.

## Operação segura

1. Use HTTPS em qualquer acesso fora de `localhost`.
2. Restrinja o servidor interno à LAN ou VPN.
3. Mantenha Node.js e dependências atualizados após homologação.
4. Faça backup consistente do banco e teste restauração.
5. Revogue tokens temporários após migrações.
6. Desative imediatamente contas que não precisam mais de acesso.

Falhas de segurança não devem ser abertas em discussão pública. O responsável técnico deve ser contatado diretamente.
