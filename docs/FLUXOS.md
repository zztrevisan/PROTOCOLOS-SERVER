# Fluxos do sistema - Hiperion Protocolos

## 1. Acesso

```text
Abrir sistema
  -> informar login e senha
  -> limite de tentativas e validação da credencial
  -> criar sessão protegida
  -> carregar telas permitidas pelo perfil
```

Falhas de credencial não criam sessão. Tentativas excessivas recebem bloqueio temporário.

## 2. Emissão e etiqueta

```text
Selecionar empresa
  -> informar departamento, entregador e documentos
  -> revisar vencimentos
  -> gerar protocolo
  -> gerar QR Code de identificação
  -> imprimir etiqueta A4 ou diretamente no envelope
```

A etiqueta apresenta número do protocolo, nome da empresa, documentos, vencimentos e QR Code. O número do box permanece apenas no ambiente interno.

## 3. Entrega

```text
Abrir protocolo atribuído
  -> conferir envelope pelo QR Code
  -> identificar quem recebeu
  -> coletar assinatura
  -> confirmar e-mails do cliente
  -> registrar entrega
  -> enviar comprovante
```

Nome, assinatura e conferência do QR Code são obrigatórios. Se o serviço de e-mail não estiver configurado ou falhar, o estado do envio fica registrado sem apagar a entrega.

## 4. Cancelamento

```text
Abrir protocolo pendente
  -> solicitar cancelamento
  -> informar justificativa
  -> confirmar
  -> registrar motivo, responsável e horário
```

O protocolo permanece no histórico. O motivo pode ser consultado a partir do status cancelado.

## 5. Exclusão e restauração

```text
Excluir protocolo
  -> ocultar das telas normais
  -> manter em Protocolos excluídos
  -> restaurar quando necessário

Excluir permanentemente
  -> confirmar identidade do registro
  -> remover protocolo e documentos associados
  -> impedir restauração
```

A exclusão de empresa é uma operação administrativa permanente. Protocolos históricos vinculados devem continuar preservados conforme a regra atual do sistema.

## 6. Sincronização móvel

```text
Operação sem conexão
  -> guardar ação pendente no dispositivo
  -> detectar retorno da conexão
  -> sincronizar
  -> atualizar o estado visível
```

Conflitos ou falhas permanecem sinalizados para nova tentativa; a interface não deve indicar conclusão antes da confirmação do servidor.
