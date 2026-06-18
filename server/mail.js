import 'dotenv/config'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'naoresponda@lashdesigner.com.br'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) return

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    })
    return await res.json()
  } catch {
    // falha silenciosa - email não crítico
  }
}

export async function notifyBookingConfirmed(name, email, service, date, time, price) {
  if (!email) return
  await sendEmail({
    to: email,
    subject: 'Agendamento Confirmado — Camille Santos Beauty',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#b76e79;">Agendamento Confirmado!</h2>
        <p>Olá <strong>${name}</strong>, seu horário foi reservado com sucesso.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Serviço</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">${service}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Data</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">${date}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Horário</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">${time}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Valor</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">R$ ${price},00</td></tr>
        </table>
        <p style="color:#999;font-size:13px;">Camille Lash Designer — Atendimento em casa</p>
      </div>
    `,
  })
}

export async function notifyBookingCancelledByAdmin(name, email, service, date, time) {
  if (!email) return
  await sendEmail({
    to: email,
    subject: 'Agendamento Cancelado — Camille Santos Beauty',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#b76e79;">Agendamento Cancelado</h2>
        <p>Olá <strong>${name}</strong>, infelizmente precisei cancelar seu agendamento.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Serviço</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">${service}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Data</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">${date}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e5e5;color:#666;">Horário</td><td style="padding:8px;border:1px solid #e5e5e5;font-weight:600;">${time}</td></tr>
        </table>
        <p>Peço desculpas pelo transtorno. Se desejar, podemos remarcar um novo horário.</p>
        <p style="color:#999;font-size:13px;">Camille Santos Beauty — Atendimento em casa</p>
      </div>
    `,
  })

  if (ADMIN_EMAIL) {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'Cancelamento realizado — Sistema Lash',
      html: `<p>Agendamento de <strong>${name}</strong> (${service}, ${date} às ${time}) foi cancelado pela administradora.</p>`,
    })
  }
}

export async function notifyBookingCancelledByClient(name, email, service, date, time) {
  if (ADMIN_EMAIL) {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'Cliente cancelou agendamento — Sistema Lash',
      html: `
        <p>A cliente <strong>${name}</strong> cancelou o agendamento:</p>
        <p>Serviço: ${service}<br>Data: ${date}<br>Horário: ${time}</p>
      `,
    })
  }

  if (email) {
    await sendEmail({
      to: email,
      subject: 'Cancelamento Confirmado — Camille Santos Beauty',
      html: `
        <p>Olá <strong>${name}</strong>, seu agendamento foi cancelado conforme solicitado.</p>
        <p>Se precisar de um novo horário, é só acessar o sistema.</p>
      `,
    })
  }
}
