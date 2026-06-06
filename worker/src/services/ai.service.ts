// Serviço de sugestões — chama a API do Gemini (Google) para recomendar títulos similares
import { Injectable, Logger } from '@nestjs/common';
import { ReviewCreatedPayload } from '../../shared/queue.constants';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async generateSuggestion(payload: ReviewCreatedPayload): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.startsWith('your_')) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          return await this.callGemini(apiKey, payload);
        } catch (err: any) {
          const is503 = err.message?.includes('503');
          if (is503 && attempt < 3) {
            this.logger.warn(`Gemini 503 (tentativa ${attempt}/3) — aguardando ${attempt * 3}s...`);
            await new Promise(r => setTimeout(r, attempt * 3000));
          } else {
            this.logger.warn(`Falha na API Gemini: ${err.message}. Usando sugestão estática.`);
            break;
          }
        }
      }
    } else {
      this.logger.warn('GEMINI_API_KEY não configurada. Usando sugestão estática.');
    }

    return this.staticSuggestion(payload);
  }

  private async callGemini(apiKey: string, payload: ReviewCreatedPayload): Promise<string> {
    const mediaLabel: Record<ReviewCreatedPayload['mediaType'], string> = {
      filme: 'filmes',
      serie: 'séries',
      livro: 'livros',
      jogo: 'jogos',
    };

    const prompt =
      `O usuário avaliou "${payload.mediaTitle}" (${payload.mediaType}) com nota ${payload.score}/5. ` +
      `Sugira exatamente 4 ${mediaLabel[payload.mediaType]} famosos e conhecidos mundialmente que ele provavelmente vai gostar, ` +
      `com base no tema e estilo de "${payload.mediaTitle}". ` +
      `Pode sugerir qualquer título famoso, não se limite a nenhum catálogo. ` +
      `Formato obrigatório (sem markdown, sem asteriscos, sem negrito, sem traços duplos):\n` +
      `1. Título — motivo em uma frase curta\n` +
      `2. Título — motivo em uma frase curta\n` +
      `3. Título — motivo em uma frase curta\n` +
      `4. Título — motivo em uma frase curta\n` +
      `Responda em português, apenas a lista numerada, sem introdução nem despedida.`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status}: ${body}`);
    }

    const data: any = await response.json();
    return data.candidates[0].content.parts[0].text as string;
  }

  // Fallback usado quando a API não está disponível
  private staticSuggestion(payload: ReviewCreatedPayload): string {
    const map: Record<ReviewCreatedPayload['mediaType'], string> = {
      filme: `Baseado na sua nota ${payload.score}/5, você pode gostar de outros títulos aclamados no mesmo gênero. Confira o IMDB ou Letterboxd para recomendações personalizadas.`,
      serie: `Sua nota ${payload.score}/5 demonstra bom gosto — explore séries similares nas plataformas de streaming ou procure outras obras dos criadores.`,
      livro: `Com base na sua avaliação ${payload.score}/5, o Goodreads é um ótimo lugar para encontrar livros bem avaliados com estilo ou tema parecido.`,
      jogo: `Nota ${payload.score}/5 registrada! OpenCritic e Metacritic listam jogos com jogabilidade e tom similares que você pode gostar.`,
    };
    return map[payload.mediaType];
  }
}
