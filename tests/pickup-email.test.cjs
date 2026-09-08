const {test}=require('node:test');
const assert=require('node:assert/strict');
const email=require('../lib/email');

test('e-mails de retirada têm assunto e identidade diferentes de entrega',async t=>{
  const previous={RESEND_API_KEY:process.env.RESEND_API_KEY,EMAIL_FROM:process.env.EMAIL_FROM};
  t.after(()=>{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
  process.env.RESEND_API_KEY='test-only';process.env.EMAIL_FROM='Teste <teste@example.com>';
  const payloads=[];
  t.mock.method(global,'fetch',async(_url,options)=>{payloads.push(JSON.parse(options.body));return {ok:true,json:async()=>({id:'test-id'})};});
  const retirada={empresa_nome:'Empresa <Teste>',box:'802',solicitante_nome:'João',entregador_nome:'Guilherme',observacao:'Buscar na recepção',retirado_em:'2026-09-08T15:30:00.000Z'};
  assert.equal((await email.enviarNotificacaoNovaRetirada({retirada,documentos:[{descricao:'Contrato'}],destinatario:'guilherme@example.com',totalPendentes:2})).status,'enviado');
  assert.equal((await email.enviarNotificacaoRetiradaColetada({retirada,documentos:[{descricao:'Contrato'}],destinatario:'joao@example.com'})).status,'enviado');
  assert.equal(payloads.length,2);
  assert.match(payloads[0].subject,/\[RETIRADA\].*Nova retirada atribuída.*2 pendentes/);
  assert.match(payloads[0].html,/RETIRADA DE DOCUMENTOS/);
  assert.match(payloads[0].html,/não sobre uma entrega de protocolo/);
  assert.match(payloads[1].subject,/\[RETIRADA\].*Documentos retirados/);
  assert.match(payloads[1].html,/Guilherme registrou a retirada/);
  assert.doesNotMatch(payloads[0].html,/Empresa <Teste>/);
});
