# Fluxos operacionais

## Acesso

```mermaid
flowchart LR
    A[Abrir sistema] --> B[Informar credenciais]
    B --> C{Credencial válida?}
    C -->|Não| D[Registrar tentativa]
    C -->|Sim| E[Criar sessão]
    E --> F[Carregar recursos permitidos]
```

## Protocolo de entrega

```mermaid
flowchart LR
    A[Nova solicitação] --> B[Selecionar empresa]
    B --> C[Definir responsável]
    C --> D[Adicionar documentos]
    D --> E[Gerar protocolo e QR]
    E --> F[Imprimir etiqueta]
    F --> G[Entregar]
    G --> H[QR ou número de contingência]
    H --> I[Nome e assinatura]
    I --> J[Registrar comprovante]
    J --> K[Enviar e-mail]
```

A falha do e-mail não desfaz a entrega. O status do envio permanece associado ao protocolo.

## Retirada de documentos

```mermaid
flowchart LR
    A[Nova retirada] --> B[Empresa e documentos]
    B --> C[Atribuir responsável]
    C --> D[Entregador recebe pendência]
    D --> E[Registrar coleta e GPS]
    E --> F[Legalização recebe aviso]
    F --> G[Conferir no escritório]
    G --> H[Registrar recebidos, faltantes e adicionais]
    H --> I[Finalizar histórico]
```

A retirada não gera número de protocolo nem etiqueta. Somente o responsável atribuído registra a coleta; Legalização ou administrador conclui a conferência.

## Cancelamento e exclusão

```mermaid
flowchart TD
    A[Protocolo pendente] --> B{Ação}
    B -->|Cancelar| C[Exigir justificativa]
    C --> D[Preservar no histórico]
    B -->|Excluir| E[Ocultar das telas normais]
    E --> F[Protocolos excluídos]
    F -->|Restaurar| A
    F -->|Excluir definitivamente| G[Remover protocolo e itens]
```

Exclusão definitiva e exclusão de retiradas são operações exclusivas do administrador.

## Operação offline

```mermaid
sequenceDiagram
    participant U as Usuário
    participant P as PWA
    participant A as API
    U->>P: conclui ação suportada
    P-->>P: guarda evidência se a conexão cair
    P->>A: sincroniza quando possível
    A-->>P: valida regra atual e confirma
    P-->>U: atualiza o estado real
```

Retiradas exigem conexão. A fila offline é reservada aos fluxos de protocolo já suportados.
