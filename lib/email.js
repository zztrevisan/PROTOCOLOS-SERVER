const fs = require('fs');
const path = require('path');

function identidadeEmail(titulo, conteudo) {
  const appUrl = String(process.env.APP_URL || 'https://hiperion-protocolos-teste.vercel.app').replace(/\/$/, '');
  let logo = '';
  try {
    logo = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8')
      .match(/src="data:image\/png;base64,([A-Za-z0-9+/=]+)"/)?.[1] || '';
  } catch {}
  return {
    attachments: logo ? [{ filename: 'hiperion.png', content: logo, content_id: 'hiperion-logo' }] : [],
    html: `<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0;background:#eef3f8;font-family:Arial,sans-serif;color:#172b45">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
        <tr><td style="padding:24px;background:#071936;color:#fff">${logo ? '<img src="cid:hiperion-logo" width="120" alt="Hiperion Assessoria Contábil" style="display:block;background:white;border-radius:8px;margin-bottom:16px">' : ''}<span style="font-family:Georgia,serif;font-size:24px">Hiperion</span> <span style="color:#9ad8f3">Protocolos</span></td></tr>
        <tr><td style="padding:28px;overflow-wrap:anywhere"><h1 style="font-size:24px;line-height:1.3;margin:0 0 20px">${escaparHtml(titulo)}</h1>${conteudo}
        <p style="margin-top:28px"><a href="${escaparHtml(appUrl)}" style="display:inline-block;background:#0d365c;color:#fff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:bold">Abrir Hiperion</a></p>
        <p style="font-size:12px;color:#667085;line-height:1.6">Consulte o sistema para ver a situação atual das entregas. Esta mensagem mostra os dados no momento do envio.</p></td></tr>
      </table></td></tr></table></body></html>`
  };
}

function dataEmail(valor) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ''));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(valor || '');
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizarDestinatarios(valor) {
  const lista = Array.isArray(valor) ? valor : [];
  return [...new Set(lista
    .map(item => String(item || '').trim().toLowerCase())
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )].slice(0, 10);
}

async function enviarComprovanteEntrega({ protocolo, itens, destinatarios }) {
  const emails = normalizarDestinatarios(destinatarios);
  if (!emails.length) return { status: 'nao_solicitado' };

  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const remetente = String(process.env.EMAIL_FROM || '').trim();
  if (!apiKey || !remetente) {
    return {
      status: 'pendente_configuracao',
      erro: 'RESEND_API_KEY ou EMAIL_FROM não configurado.'
    };
  }

  const documentos = (itens || [])
    .map(item => `<li>${escaparHtml(item.descricao)}</li>`)
    .join('');
  const numero = String(protocolo.numero).padStart(6, '0');
  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: remetente,
      to: emails,
      subject: `Comprovante de entrega · Protocolo ${numero}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#172b45;line-height:1.55">
          <h2 style="margin-bottom:4px">Comprovante de entrega</h2>
          <p><strong>Protocolo:</strong> ${numero}</p>
          <p><strong>Empresa:</strong> ${escaparHtml(protocolo.cliente)}</p>
          <p><strong>Recebido por:</strong> ${escaparHtml(protocolo.recebido_por)}</p>
          <p><strong>Data da entrega:</strong> ${escaparHtml(protocolo.entregue_em)}</p>
          <p><strong>Documentos:</strong></p>
          <ul>${documentos}</ul>
          <p style="color:#667085;font-size:12px">Mensagem enviada automaticamente pelo Hiperion Protocolos após confirmação da entrega.</p>
        </div>
      `
    })
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    return { status: 'falhou', erro: dados.message || `Falha HTTP ${resposta.status}` };
  }
  return { status: 'enviado', id: dados.id || null };
}

async function enviarNotificacaoNovoProtocolo({ protocolo, itens, destinatario, totalPendentes = 1 }) {
  const emails = normalizarDestinatarios([destinatario]);
  if (!emails.length) return { status: 'sem_email' };

  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const remetente = String(process.env.EMAIL_FROM || '').trim();
  if (!apiKey || !remetente) {
    return {
      status: 'pendente_configuracao',
      erro: 'RESEND_API_KEY ou EMAIL_FROM não configurado.'
    };
  }

  const documentos = (itens || [])
    .map(item => {
      const vencimento = item.vencimento
        ? `<br><span style="color:#667085;font-size:13px">Vencimento: ${escaparHtml(dataEmail(item.vencimento))}</span>`
        : '';
      return `<li style="margin-bottom:6px">${escaparHtml(item.descricao)}${vencimento}</li>`;
    })
    .join('');
  const numero = String(protocolo.numero).padStart(6, '0');
  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: remetente,
      to: emails,
      subject: `Nova entrega adicionada · ${totalPendentes} ${totalPendentes === 1 ? 'entrega pendente' : 'entregas pendentes'}`,
      ...identidadeEmail('Uma nova entrega foi adicionada', `
        <div style="font-family:Arial,sans-serif;color:#172b45;line-height:1.55;max-width:620px">
          <p style="padding:16px;background:#edf5fc;border-radius:10px;color:#0d365c;font-size:20px"><strong>Você tem ${Number(totalPendentes)} ${totalPendentes === 1 ? 'entrega pendente' : 'entregas pendentes'}</strong><br><span style="font-size:13px">Incluindo esta nova solicitação.</span></p>
          <p><strong>${escaparHtml(protocolo.emissor)}</strong> atribuiu uma nova entrega a você.</p>
          <p style="color:#667085;font-size:12px;text-transform:uppercase">Entrega recém-adicionada</p>
          <p><strong>Protocolo:</strong> ${numero}<br>
          <strong>Empresa:</strong> ${escaparHtml(protocolo.cliente)}<br>
          <strong>Departamento:</strong> ${escaparHtml(protocolo.departamento)}</p>
          <p><strong>Documentos:</strong></p>
          <ul>${documentos}</ul>
          <p style="color:#667085;font-size:12px">Abra o Hiperion Protocolos para acompanhar e confirmar a entrega.</p>
        </div>
      `)
    })
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    return { status: 'falhou', erro: dados.message || `Falha HTTP ${resposta.status}` };
  }
  return { status: 'enviado', id: dados.id || null };
}

async function enviarAlertaVencimentos({ destinatario, nomeEntregador, itens }) {
  const emails = normalizarDestinatarios([destinatario]);
  if (!emails.length) return { status: 'sem_email' };

  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const remetente = String(process.env.EMAIL_FROM || '').trim();
  if (!apiKey || !remetente) {
    return { status: 'pendente_configuracao', erro: 'RESEND_API_KEY ou EMAIL_FROM não configurado.' };
  }

  const linhas = (itens || []).map(item => {
    const numero = String(item.numero).padStart(6, '0');
    const data = escaparHtml(dataEmail(item.vencimento));
    const prazo = Number(item.dias_restantes) === 1
      ? 'vence amanhã'
      : `vence em ${item.dias_restantes} dias`;
    return `<li style="margin-bottom:16px"><strong>Protocolo ${numero} · ${escaparHtml(item.cliente)}</strong><br>${escaparHtml(item.descricao)}<br><span style="background:#fff3d6;color:#945600;padding:4px 8px;display:inline-block">${data} · ${prazo}</span></li>`;
  }).join('');

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: remetente,
      to: emails,
      subject: `${itens.length} vencimento${itens.length === 1 ? '' : 's'} próximo${itens.length === 1 ? '' : 's'} · Hiperion`,
      ...identidadeEmail('Documentos próximos do vencimento', `
        <div style="font-family:Arial,sans-serif;color:#172b45;line-height:1.55;max-width:650px">
          <p>Olá, ${escaparHtml(nomeEntregador)}. Estes documentos atribuídos a você vencem nos próximos 3 dias:</p>
          <ul>${linhas}</ul>
          <p style="color:#667085;font-size:12px">Este lembrete é enviado diariamente até o vencimento ou até a conclusão do protocolo.</p>
        </div>`)
    })
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) return { status: 'falhou', erro: dados.message || `Falha HTTP ${resposta.status}` };
  return { status: 'enviado', id: dados.id || null };
}

function dataHoraEmail(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? escaparHtml(valor) : data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

async function enviarEmailRetirada({ destinatario, assunto, titulo, destaque, retirada, documentos = [], rodape }) {
  const emails = normalizarDestinatarios([destinatario]);
  if (!emails.length) return { status: 'sem_email' };
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const remetente = String(process.env.EMAIL_FROM || '').trim();
  if (!apiKey || !remetente) return { status: 'pendente_configuracao', erro: 'RESEND_API_KEY ou EMAIL_FROM não configurado.' };
  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: remetente, to: emails, subject: `[RETIRADA] ${assunto}`,
      ...await identidadeEmail(titulo, `<div style="font-family:Arial,sans-serif;color:#172b45;line-height:1.55;max-width:620px">
        <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:#7b3f98;color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em">RETIRADA DE DOCUMENTOS</div>
        <p style="padding:17px;background:#faf0ff;border-left:5px solid #7b3f98;border-radius:10px;color:#54256c;font-size:18px"><strong>${escaparHtml(destaque)}</strong></p>
        <p><strong>Empresa:</strong> ${escaparHtml(retirada.empresa_nome)}<br><strong>Solicitado por:</strong> ${escaparHtml(retirada.solicitante_nome)}<br><strong>Responsável pela retirada:</strong> ${escaparHtml(retirada.entregador_nome)}</p>
        ${documentos.length ? `<p><strong>Documentos:</strong></p><ul>${documentos.map(item => `<li>${escaparHtml(item.descricao || item)}</li>`).join('')}</ul>` : ''}
        ${retirada.retirado_em ? `<p><strong>Retirada registrada em:</strong> ${dataHoraEmail(retirada.retirado_em)}</p>` : ''}
        <p style="color:#725b7d;font-size:12px">${escaparHtml(rodape)}</p>
      </div>`)
    })
  });
  const dados = await resposta.json().catch(() => ({}));
  return resposta.ok ? { status: 'enviado', id: dados.id || null } : { status: 'falhou', erro: dados.message || `Falha HTTP ${resposta.status}` };
}

function enviarNotificacaoNovaRetirada({ retirada, documentos, destinatario, totalPendentes = 1 }) {
  return enviarEmailRetirada({ destinatario, assunto: `Nova retirada atribuída · ${totalPendentes} pendente${Number(totalPendentes) === 1 ? '' : 's'}`, titulo: 'Nova retirada atribuída', destaque: `${retirada.solicitante_nome} solicitou uma retirada para você`, retirada, documentos, rodape: 'Esta mensagem é sobre uma coleta de documentos, não sobre uma entrega de protocolo.' });
}

function enviarNotificacaoRetiradaColetada({ retirada, documentos, destinatario }) {
  return enviarEmailRetirada({ destinatario, assunto: `Documentos retirados · ${retirada.empresa_nome}`, titulo: 'Retirada realizada', destaque: `${retirada.entregador_nome} registrou a retirada dos documentos`, retirada, documentos, rodape: 'A documentação segue agora para conferência no escritório.' });
}

module.exports = {
  normalizarDestinatarios,
  enviarComprovanteEntrega,
  enviarNotificacaoNovoProtocolo,
  enviarAlertaVencimentos,
  enviarNotificacaoNovaRetirada,
  enviarNotificacaoRetiradaColetada
};
