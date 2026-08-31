# Design System - Hiperion Protocolos

## Princípios

O sistema deve parecer uma ferramenta interna confiável: sóbrio, claro e rápido de operar. A interface prioriza leitura, rastreabilidade e prevenção de ações acidentais.

1. **Clareza antes de decoração:** cada tela deve deixar evidente o próximo passo.
2. **Status reconhecíveis:** cor, texto e contexto trabalham juntos; nunca apenas a cor.
3. **Ações proporcionais ao risco:** exclusões e cancelamentos exigem confirmação clara.
4. **Consistência entre desktop e celular:** os mesmos nomes e estados devem aparecer nos dois formatos.
5. **Impressão funcional:** etiquetas e envelopes são parte do produto, não uma adaptação da tela.

## Identidade visual

| Papel | Cor | Uso |
| --- | --- | --- |
| Azul-marinho | `#071936` | navegação, títulos e ações principais |
| Azul | `#1478BD` | destaque, foco e elementos informativos |
| Fundo | `#F3F6FA` | plano geral da aplicação |
| Superfície | `#FFFFFF` | cartões, diálogos e formulários |
| Texto | `#142033` | conteúdo principal |
| Texto secundário | `#667085` | ajuda, metadados e descrições |
| Sucesso | `#18794E` | concluído, conectado e confirmação |
| Atenção | `#A15C0A` | pendência e cancelamento contextual |
| Perigo | `#B42318` | exclusão permanente e falhas críticas |

## Tipografia

- Interface: `Inter`, com fallback para `Segoe UI` e `Arial`.
- Marca no cabeçalho: família serifada, próxima de `Palatino Linotype` ou `Georgia`.
- Títulos: peso 700 ou 800, frases curtas e sem caixa alta contínua.
- Texto de apoio: menor, porém com contraste suficiente e entrelinha confortável.

## Componentes

### Botões

- **Primário:** azul-marinho, texto branco, uma ação principal por contexto.
- **Secundário:** fundo neutro, usado para voltar, fechar ou adiar.
- **Atenção:** laranja claro, reservado ao cancelamento de protocolo.
- **Perigo:** vermelho, usado somente para exclusão permanente.

### Status

- Aguardando entrega: laranja.
- Em andamento ou informação: azul.
- Entregue/concluído: verde.
- Cancelado: laranja contextual, acompanhado de indicação clicável para o motivo.
- Excluído: vermelho apenas nas telas de administração e recuperação.

### Formulários e diálogos

- rótulos sempre visíveis;
- foco com contorno azul e contraste alto;
- mensagens de erro próximas da ação correspondente;
- diálogos destrutivos explicam consequência e possibilidade de restauração;
- alvos de toque amplos no celular.

## Impressão

Etiquetas e envelopes usam alto contraste, fundo branco, lista vertical de documentos, vencimentos próximos ao item e QR Code isolado visualmente. O box é informação interna e não aparece para o cliente.
