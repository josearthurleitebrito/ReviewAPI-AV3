// Value Object de senha — valida comprimento mínimo, ignorando valores já hasheados
export class Password {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): void {
    // Valores que começam com $2a$, $2b$ ou $2y$ são hashes bcrypt — não precisam ser validados
    if (value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$')) {
      return;
    }
    if (value.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }
  }

  getLength(): number {
    return this.value.length;
  }
}
