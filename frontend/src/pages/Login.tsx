// Página de login e cadastro — alterna entre os dois modos com o mesmo formulário
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { LOGIN_MUTATION, REGISTER_MUTATION, LOGIN_OAUTH_MUTATION } from '../graphql/queries';

export default function Login() {
  // Alterna entre modo login e cadastro
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Mutations GraphQL para os três tipos de autenticação
  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const [loginOAuth, { loading: oauthLoading }] = useMutation(LOGIN_OAUTH_MUTATION);

  // Trata o envio do formulário de login ou cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || (isRegister && !name)) {
      setErrorMsg('Por favor preencha todos os campos.');
      return;
    }

    try {
      if (isRegister) {
        // Cadastro: cria conta e já faz login automático
        const { data } = await register({ variables: { input: { name, email, password } } });
        if (data?.register?.accessToken) {
          localStorage.setItem('token', data.register.accessToken);
          localStorage.setItem('user', JSON.stringify(data.register.user));
          navigate('/dashboard');
        }
      } else {
        // Login com email e senha
        const { data } = await login({ variables: { input: { email, password } } });
        if (data?.login?.accessToken) {
          localStorage.setItem('token', data.login.accessToken);
          localStorage.setItem('user', JSON.stringify(data.login.user));
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro no servidor.');
    }
  };

  // Login real com Google — recebe o credential token e valida no backend
  const handleGoogleLogin = async (credentialResponse: { credential?: string }) => {
    setErrorMsg('');
    if (!credentialResponse.credential) {
      setErrorMsg('Token do Google não recebido.');
      return;
    }
    try {
      const { data } = await loginOAuth({
        variables: {
          input: { token: credentialResponse.credential, provider: 'google' },
        }
      });
      if (data?.loginOAuth?.accessToken) {
        localStorage.setItem('token', data.loginOAuth.accessToken);
        localStorage.setItem('user', JSON.stringify(data.loginOAuth.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro no login com Google.');
    }
  };

  const loading = loginLoading || registerLoading || oauthLoading;

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>Gamers & Media Reviews</h2>
          <p>{isRegister ? 'Crie sua conta para começar' : 'Acesse o catálogo e dê a sua opinião'}</p>
        </div>

        {/* Exibe mensagem de erro se houver */}
        {errorMsg && <div className="error-badge">{errorMsg}</div>}

        {/* Formulário principal: login ou cadastro */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: José Arthur"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Endereço de E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processando...' : isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
          ou
        </div>

        {/* Login com Google real via @react-oauth/google */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setErrorMsg('Falha no login com Google.')}
            text="signin_with"
            shape="rectangular"
            locale="pt-BR"
          />
        </div>

        {/* Botão para alternar entre login e cadastro */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isRegister ? 'Já possui conta? Acesse aqui' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
