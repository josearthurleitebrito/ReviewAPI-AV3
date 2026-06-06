// Todas as queries e mutations GraphQL usadas pelo frontend
import { gql } from '@apollo/client';

// ── Autenticação ─────────────────────────────────────────────────────────────

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        name
        email
      }
    }
  }
`;

// Login via token OAuth (Google)
export const LOGIN_OAUTH_MUTATION = gql`
  mutation LoginOAuth($input: LoginOAuthInput!) {
    loginOAuth(input: $input) {
      accessToken
      user {
        id
        name
        email
      }
    }
  }
`;

// Retorna os dados do usuário autenticado
export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;

// ── Catálogo ──────────────────────────────────────────────────────────────────

export const GET_MOVIES = gql`
  query GetMovies {
    movies {
      id
      titulo
      sinopse
      externalId
    }
  }
`;

export const GET_SERIES = gql`
  query GetSeries {
    series {
      id
      titulo
      sinopse
      externalId
    }
  }
`;

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      titulo
      autor
      externalId
    }
  }
`;

export const GET_GAMES = gql`
  query GetGames {
    games {
      id
      titulo
      desenvolvedora
      externalId
    }
  }
`;

// Sincroniza o catálogo com a API externa (retorna se usou dados mockados)
export const SYNC_CATALOG_MUTATION = gql`
  mutation SyncCatalog($mediaType: String!) {
    syncCatalog(mediaType: $mediaType) {
      success
      count
      message
      usedMock
    }
  }
`;

// ── Avaliações ────────────────────────────────────────────────────────────────

// Busca avaliações de um item de mídia específico
export const GET_REVIEWS_BY_MEDIA = gql`
  query GetReviewsByMedia($filmeId: Int, $serieId: Int, $livroId: Int, $jogoId: Int) {
    reviewsByMedia(filmeId: $filmeId, serieId: $serieId, livroId: $livroId, jogoId: $jogoId) {
      id
      score
      content
      createdAt
      user {
        id
        name
        email
      }
    }
  }
`;

// Cria uma nova avaliação para um item de mídia
export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      score
      content
      createdAt
    }
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($reviewId: Int!) {
    deleteReview(reviewId: $reviewId) {
      id
    }
  }
`;

// Retorna todas as avaliações do usuário logado com o item avaliado
export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    myReviews {
      id
      score
      content
      createdAt
      filme {
        id
        titulo
      }
      serie {
        id
        titulo
      }
      livro {
        id
        titulo
      }
      jogo {
        id
        titulo
      }
    }
  }
`;
