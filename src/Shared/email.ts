// Value Object de email — garante que o e-mail seja válido ao ser instanciado
export class Email {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    // Regex simplificada baseada no RFC 5322 — aceita formatos comuns como .com, .com.br, .org
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('E-mail inválido');
    }
  }
}
