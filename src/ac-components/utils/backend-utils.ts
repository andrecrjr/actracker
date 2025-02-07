// utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
) => {
  try {
    const data = await resend.emails.send({
      from: 'SeuNome <seuemail@seudominio.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });
    console.log('Email enviado com sucesso:', data);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
};
