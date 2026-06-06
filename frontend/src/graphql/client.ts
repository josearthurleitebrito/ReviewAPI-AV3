// Configuração do Apollo Client — gerencia as requisições GraphQL do frontend
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// VITE_API_URL é definido no build do Railway; em Docker local usa proxy nginx; em dev aponta direto
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? '/graphql'
      : `http://${window.location.hostname}:3000/graphql`),
});

// Intercepta cada requisição e injeta o token JWT no header Authorization
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Exporta o cliente configurado com cache em memória
export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
