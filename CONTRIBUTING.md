# Contribuindo com o Hiperion Protocolos

## Antes de alterar

1. Entenda qual fluxo será afetado: emissão, etiqueta, entrega, administração ou sincronização.
2. Preserve a paridade entre `server-turso.js` e `server.js` quando a regra existir nos dois ambientes.
3. Não inclua `.env`, banco local, logs, tokens ou mudanças acidentais de `node_modules`.

## Validação mínima

- execute `node --check server-turso.js` e `node --check server.js`;
- valide o fluxo alterado localmente;
- confira a versão móvel quando houver mudança visual;
- confirme que o acesso respeita o perfil do usuário;
- em mudanças de impressão, revise a prévia no tamanho de papel correto.

## Commits

Use uma frase curta, direta e em português. O título deve explicar o resultado, não a ferramenta usada.

Exemplos:

```text
Corrige alinhamento da etiqueta no envelope B4
Limita tentativas de acesso à API
Documenta arquitetura e fluxos do sistema
```

Evite títulos vagos como `ajustes`, `mudanças`, `update` ou descrições longas. Separe assuntos diferentes em commits diferentes sempre que isso facilitar a revisão.

## Pull requests

Descreva o problema, o comportamento esperado, o que foi validado e, quando houver interface, inclua uma imagem antes/depois. Não copie uma lista genérica: registre somente o que realmente mudou.
