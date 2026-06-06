// Schemas Zod para validação dos inputs de autenticação
import { z } from 'zod';

// Validação do cadastro: nome mínimo 2 chars, email válido, senha mínimo 6 chars
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Validação do login: email válido e senha não vazia
export const LoginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Validação do login OAuth: token e provedor não podem ser vazios
export const LoginOAuthSchema = z.object({
  token: z.string().min(1, 'Token OAuth é obrigatório'),
  provider: z.string().min(1, 'Provedor OAuth é obrigatório'),
});

// Tipos TypeScript inferidos dos schemas (usados nos services)
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type LoginOAuthDto = z.infer<typeof LoginOAuthSchema>;
