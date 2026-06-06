// Serviço de e-mail — envia confirmação de avaliação via Resend
import { Injectable, Logger } from '@nestjs/common';
import { ReviewCreatedPayload } from '../../shared/queue.constants';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey = process.env.RESEND_API_KEY;

  constructor() {
    if (this.apiKey && !this.apiKey.startsWith('your_')) {
      this.logger.log('Resend configurado.');
    } else {
      this.logger.warn('RESEND_API_KEY não configurada — e-mails serão logados no console (modo mock).');
    }
  }

  async sendReviewConfirmation(
    payload: ReviewCreatedPayload,
    aiSuggestion: string,
  ): Promise<void> {
    const stars = '★'.repeat(payload.score) + '☆'.repeat(5 - payload.score);
    const subject = `Sua avaliação de "${payload.mediaTitle}" foi publicada! ✅`;
    const html = this.buildHtml(payload, stars, aiSuggestion);

    if (!this.apiKey || this.apiKey.startsWith('your_')) {
      this.logger.log(`[MOCK EMAIL] ──────────────────────────────`);
      this.logger.log(`  Para    : ${payload.userEmail}`);
      this.logger.log(`  Assunto : ${subject}`);
      this.logger.log(`  Nota    : ${stars} (${payload.score}/5)`);
      this.logger.log(`  Dica    : ${aiSuggestion}`);
      this.logger.log(`────────────────────────────────────────────`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ReviewAPI <onboarding@resend.dev>',
        to: payload.userEmail,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend erro ${response.status}: ${body}`);
    }

    this.logger.log(`E-mail enviado para ${payload.userEmail}`);
  }

  private buildHtml(
    payload: ReviewCreatedPayload,
    stars: string,
    aiSuggestion: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">

        <tr><td style="background:#4f46e5;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">ReviewAPI</h1>
          <p style="margin:4px 0 0;color:#c7d2fe;font-size:14px;">Sua avaliação foi publicada! ✅</p>
        </td></tr>

        <tr><td style="padding:32px;">
          <p style="font-size:16px;color:#111827;">Olá <strong>${payload.userName}</strong>,</p>
          <p style="color:#374151;">Sua avaliação de
            <strong>${payload.mediaTitle}</strong>
            <span style="color:#6b7280;">(${payload.mediaType})</span>
            foi publicada com sucesso.
          </p>

          <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:20px;letter-spacing:3px;">${stars}</p>
            <p style="margin:0;font-size:13px;color:#4b5563;font-style:italic;">"${payload.content}"</p>
          </div>

          <div style="border-left:4px solid #4f46e5;background:#eef2ff;border-radius:0 8px 8px 0;padding:16px;margin:20px 0;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#3730a3;">💡 Sugestão</p>
            <p style="margin:0;font-size:13px;color:#374151;white-space:pre-line;">${aiSuggestion}</p>
          </div>

          <p style="font-size:14px;color:#6b7280;">
            Continue avaliando e descobrindo ótimos conteúdos!<br/>Equipe ReviewAPI
          </p>
        </td></tr>

        <tr><td style="background:#f3f4f6;padding:16px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            ReviewAPI · Unifor · Projeto Final AV3 · ${new Date().getFullYear()}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
