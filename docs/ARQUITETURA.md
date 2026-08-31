# Arquitetura de software - Hiperion Protocolos

## Visão geral

O Hiperion Protocolos é uma aplicação web monolítica em Node.js. A mesma interface atende dois modos de operação: hospedado na Vercel com Turso e interno com SQLite.

```text
Usuário
  -> interface web/PWA
  -> API Express
  -> autenticação, RBAC e regras de negócio
  -> Turso ou SQLite
  -> Resend quando houver comprovante por e-mail
```

## Camadas

### Interface

`public/index.html` concentra layout, estilos e comportamento da aplicação. O service worker oferece recursos de PWA e apoio ao uso móvel. O leitor de QR Code usa biblioteca mantida localmente em `public/vendor`.

### Aplicação

`server-turso.js` é a entrada da nuvem. `server.js` é a entrada do servidor interno. Ambos expõem a interface estática, sessão, permissões e operações de clientes, usuários e protocolos.

### Dados

- `usuarios`: identidade, departamento, perfil e credenciais;
- `sessoes`: tokens de sessão com expiração;
- `clientes`: empresas, endereço e e-mails de comprovante;
- `protocolos`: ciclo de vida, responsáveis, assinatura e auditoria;
- `protocolo_itens`: documentos e vencimentos vinculados ao protocolo;
- `limites_acesso`: contadores temporários do rate limit na versão distribuída.

### Integrações

- **Turso:** banco remoto da versão hospedada;
- **SQLite:** banco do servidor interno;
- **Resend:** envio do comprovante após a entrega;
- **Vercel:** execução e distribuição da versão em nuvem.

## Autenticação e autorização

A sessão é identificada por cookie protegido e validada antes das rotas operacionais. As permissões são aplicadas no servidor, não apenas escondidas na interface.

- Administrador: usuários, configurações e operações administrativas.
- Emissor: criação e manutenção operacional de protocolos.
- Entregador: protocolos atribuídos e confirmação de entrega.
- Exceções de departamento, como Legalização, são tratadas explicitamente nos middlewares existentes.

## Controles de segurança

- senha armazenada como derivação criptográfica com salt;
- cookies `HttpOnly`, `SameSite=Lax` e `Secure` em produção;
- validação de origem para alterações da API;
- rate limit no login e nas mutações autenticadas;
- cabeçalhos contra sniffing, framing e vazamento de referência;
- credenciais fornecidas por variáveis de ambiente.

## Decisões e limites atuais

A duplicação entre os dois servidores facilita a operação independente, mas exige validar toda regra nos dois arquivos. A interface em arquivo único reduz a complexidade de implantação, porém aumenta o custo de manutenção. Uma evolução futura pode extrair regras e rotas compartilhadas sem mudar a experiência atual.
