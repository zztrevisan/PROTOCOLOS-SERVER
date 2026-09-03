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

async function enviarNotificacaoNovoProtocolo({ protocolo, itens, destinatario }) {
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
        ? ` <span style="color:#667085">- vencimento ${escaparHtml(item.vencimento)}</span>`
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
      subject: `Nova entrega atribuída - Protocolo ${numero}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#172b45;line-height:1.55;max-width:620px">
          <h2 style="margin-bottom:4px">Nova entrega atribuída</h2>
          <p><strong>${escaparHtml(protocolo.emissor)}</strong> criou uma nova solicitação para você.</p>
          <p><strong>Protocolo:</strong> ${numero}<br>
          <strong>Empresa:</strong> ${escaparHtml(protocolo.cliente)}<br>
          <strong>Departamento:</strong> ${escaparHtml(protocolo.departamento)}</p>
          <p><strong>Documentos:</strong></p>
          <ul>${documentos}</ul>
          <p style="color:#667085;font-size:12px">Abra o Hiperion Protocolos para acompanhar e confirmar a entrega.</p>
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

module.exports = {
  normalizarDestinatarios,
  enviarComprovanteEntrega,
  enviarNotificacaoNovoProtocolo
};
