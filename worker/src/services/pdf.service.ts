// Serviço de PDF — gera um comprovante em PDF para cada avaliação criada
import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { ReviewCreatedPayload } from '../../shared/queue.constants';

// Paleta de cores do PDF
const INDIGO = '#4f46e5';
const GRAY_DARK = '#111827';
const GRAY_MID = '#374151';
const GRAY_LIGHT = '#9ca3af';
const BORDER = '#e5e7eb';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly outputDir = join(process.cwd(), 'pdfs'); // Pasta onde os PDFs são salvos

  // Gera o PDF e retorna o caminho do arquivo criado
  async generateReviewPdf(
    payload: ReviewCreatedPayload,
    aiSuggestion: string,
  ): Promise<string> {
    mkdirSync(this.outputDir, { recursive: true });

    const filename = `review-${payload.reviewId}-${Date.now()}.pdf`;
    const filepath = join(this.outputDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = createWriteStream(filepath);
      doc.pipe(stream);

      this.buildDocument(doc, payload, aiSuggestion);

      doc.end();
      stream.on('finish', () => {
        this.logger.log(`PDF gerado: ${filepath}`);
        resolve(filepath);
      });
      stream.on('error', reject);
    });
  }

  // Monta o conteúdo visual do documento PDF
  private buildDocument(
    doc: PDFKit.PDFDocument,
    payload: ReviewCreatedPayload,
    aiSuggestion: string,
  ): void {
    const stars = '★'.repeat(payload.score) + '☆'.repeat(5 - payload.score);
    const dateStr = new Date(payload.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Faixa de cabeçalho com cor da marca
    doc.rect(0, 0, doc.page.width, 90).fill(INDIGO);
    doc
      .fillColor('#ffffff')
      .fontSize(26)
      .font('Helvetica-Bold')
      .text('ReviewAPI', 50, 22, { align: 'center' });
    doc
      .fillColor('#c7d2fe')
      .fontSize(12)
      .font('Helvetica')
      .text('Comprovante de Avaliação', 50, 56, { align: 'center' });

    doc.y = 110;

    // Dados do avaliador
    this.sectionTitle(doc, 'Avaliador');
    this.row(doc, 'Nome', payload.userName);
    this.row(doc, 'Email', payload.userEmail);
    this.row(doc, 'Data', dateStr);

    this.divider(doc);

    // Dados da mídia avaliada
    this.sectionTitle(doc, 'Mídia');
    this.row(doc, 'Tipo', payload.mediaType.toUpperCase());
    this.row(doc, 'Título', payload.mediaTitle);

    this.divider(doc);

    // Nota em estrelas
    this.sectionTitle(doc, 'Nota');
    doc
      .fillColor(INDIGO)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`${stars}  (${payload.score}/5)`, { continued: false });

    this.divider(doc);

    // Texto da avaliação
    this.sectionTitle(doc, 'Avaliação');
    doc
      .fillColor(GRAY_MID)
      .fontSize(11)
      .font('Helvetica')
      .text(`"${payload.content}"`, { align: 'justify', lineGap: 3 });

    this.divider(doc);

    // Sugestão personalizada
    this.sectionTitle(doc, '💡  Sugestão');
    doc
      .fillColor(GRAY_MID)
      .fontSize(11)
      .font('Helvetica')
      .text(aiSuggestion, { align: 'justify', lineGap: 3 });

    // Linha de rodapé
    const footerY = doc.page.height - 50;
    doc
      .moveTo(50, footerY)
      .lineTo(doc.page.width - 50, footerY)
      .strokeColor(BORDER)
      .lineWidth(1)
      .stroke();

    doc
      .fillColor(GRAY_LIGHT)
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Gerado pelo Worker ReviewAPI · ${new Date().toISOString()}`,
        50,
        footerY + 8,
        { align: 'center', width: doc.page.width - 100 },
      );
  }

  // Renderiza um título de seção em destaque
  private sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
    doc.moveDown(0.4);
    doc
      .fillColor(INDIGO)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(title);
    doc.moveDown(0.3);
  }

  // Renderiza uma linha de label + valor
  private row(doc: PDFKit.PDFDocument, label: string, value: string): void {
    doc
      .fillColor(GRAY_LIGHT)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`${label}: `, { continued: true });
    doc
      .fillColor(GRAY_DARK)
      .fontSize(10)
      .font('Helvetica')
      .text(value);
  }

  // Desenha uma linha divisória entre seções
  private divider(doc: PDFKit.PDFDocument): void {
    doc.moveDown(0.6);
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor(BORDER)
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.4);
  }
}
