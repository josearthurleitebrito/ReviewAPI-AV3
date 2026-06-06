// Componente raiz — configura o Apollo Provider, rotas e guards de autenticação
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Detail from './pages/Detail';
import Profile from './pages/Profile';

// Rota protegida: redireciona para login se não houver token
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

// Rota pública: redireciona para o dashboard se já estiver autenticado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    // Provê o cliente Apollo para todos os componentes filhos
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          {/* Rota de login — acessível apenas sem autenticação */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Dashboard — catálogo e sincronização */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Página de detalhes de um item + avaliações */}
          <Route
            path="/detail/:type/:id"
            element={
              <ProtectedRoute>
                <Detail />
              </ProtectedRoute>
            }
          />

          {/* Perfil do usuário com histórico de avaliações */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Qualquer rota desconhecida redireciona para o início */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}
