# AV3 Reviews — Projeto Final Técnicas de Integração de Sistemas

## Acesso à Demonstração

> Clique nos links abaixo para acessar os serviços diretamente — nenhuma instalação necessária.

| Serviço                      | Link                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Frontend (aplicação)         | [frontend-production-6745.up.railway.app](https://frontend-production-6745.up.railway.app)               |
| Backend — GraphQL Playground | [backend-production-1fd9.up.railway.app/graphql](https://backend-production-1fd9.up.railway.app/graphql) |
| RabbitMQ — Painel CloudAMQP  | [Acessar painel](http://api.cloudamqp.com/console/d9cf25a7-14f8-46d5-9301-6999feffc09d/details)          |

---

## Integrantes do Time

| Nome                    | Matrícula |
| ----------------------- | --------- |
| Guilherme Almeida       | 2410535   |
| José Arthur Leite Brito | 2315760   |
| Levi Mauricio Dantas    | 2520373   |
| Mateus Coimbra Braga    | 2410366   |

---

> Plataforma full-stack de avaliação de mídias (filmes, séries, livros e jogos).  
> O usuário se cadastra, importa catálogos de APIs externas para o banco local e publica avaliações com nota de 1 a 5 estrelas.  
> Ao publicar, recebe um e-mail de confirmação com sugestões de títulos similares geradas por IA.

**Disciplina:** Técnicas de Integração de Sistemas — Unifor  
**Curso:** Tecnologia da Informação

---

## Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Docker Compose                              │
│                                                                      │
│  ┌──────────┐    ┌─────────────────┐    ┌────────────────────────┐  │
│  │  nginx   │───►│  NestJS + GQL   │───►│      PostgreSQL        │  │
│  │  :80     │    │  :3000          │    │      (Prisma ORM)      │  │
│  │ React SPA│    │  Apollo Server  │    └────────────────────────┘  │
│  └──────────┘    └────────┬────────┘                                │
│                           │                                          │
│                  ┌────────▼────────┐    ┌────────────────────────┐  │
│                  │    RabbitMQ     │───►│   Worker NestJS        │  │
│                  │  :5672/:15672   │    │   Gemini IA + Resend   │  │
│                  └─────────────────┘    │   + PDF                │  │
│                                         └────────────────────────┘  │
│                                                                      │
│                  ┌──────────────────────────────────────────────┐   │
│                  │              APIs Externas                    │   │
│                  │  TMDB · RAWG · Open Library · Gemini · Resend│   │
│                  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

| Camada          | Tecnologia                                         |
| --------------- | -------------------------------------------------- |
| Backend         | NestJS 11 + GraphQL (Apollo Server v5, code-first) |
| ORM / Banco     | Prisma + PostgreSQL 15                             |
| Mensageria      | RabbitMQ 3                                         |
| Autenticação    | JWT (passport-jwt) + bcrypt + Google OAuth real    |
| Validação       | Zod (pipe global no NestJS)                        |
| Frontend        | React 19 + Vite + Apollo Client                    |
| Login Social    | @react-oauth/google (botão Google real)            |
| Servidor SPA    | nginx (proxy reverso para o backend)               |
| IA de Sugestões | Google Gemini 2.5 Flash                            |
| E-mail          | Resend API                                         |
| PDF             | pdfkit                                             |
| Infraestrutura  | Docker + Docker Compose (5 containers)             |

---

## Como Rodar

### Pré-requisito

Docker Desktop instalado e rodando.

### 1. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha as chaves:

```bash
cp .env.example .env
```

> Veja a seção **[Obtendo as Chaves de API](#obtendo-as-chaves-de-api)** logo abaixo para saber onde conseguir cada uma.  
> O projeto funciona **sem nenhuma chave configurada** — usará dados mockados para catálogo, modo console para e-mails e sugestões genéricas no lugar da IA.

### 2. Suba todos os containers

```bash
docker compose up --build
```

Isso constrói e inicia 5 containers:

| Container         | Porta local      | Descrição                          |
| ----------------- | ---------------- | ---------------------------------- |
| `review-postgres` | `5433`           | Banco de dados PostgreSQL          |
| `review-rabbitmq` | `5672` e `15672` | Broker de mensagens                |
| `review-backend`  | `3000`           | API GraphQL (NestJS)               |
| `review-worker`   | _(sem porta)_    | Worker: IA + e-mail + PDF          |
| `review-frontend` | `80`             | Interface React servida pelo nginx |

> A porta local do Postgres é `5433` (não a padrão `5432`) para não conflitar com instalações locais.

### URLs após subir

| Serviço             | URL                                                    |
| ------------------- | ------------------------------------------------------ |
| Frontend (app)      | http://localhost                                       |
| GraphQL Playground  | http://localhost:3000/graphql                          |
| RabbitMQ Management | http://localhost:15672 — user: `guest` / pass: `guest` |

---

## Deploy no Railway

O projeto pode ser implantado no Railway com 4 serviços: **Backend**, **Worker**, **Frontend** e **PostgreSQL** (gerenciado pelo Railway). O RabbitMQ é fornecido pelo CloudAMQP (plano gratuito externo).

### Pré-requisitos

- Conta no [Railway](https://railway.app)
- Repositório **próprio** no GitHub (Railway requer que você seja dono — faça um fork se necessário)
- Conta no [CloudAMQP](https://cloudamqp.com) para o RabbitMQ (plano Lemur — gratuito)

---

### 1. Crie o projeto e adicione o PostgreSQL

No Railway, crie um novo projeto e adicione um serviço **PostgreSQL**. Railway fornece a `DATABASE_URL` automaticamente.

---

### 2. Configure o CloudAMQP (RabbitMQ externo)

1. Crie uma conta em **cloudamqp.com** e crie uma instância no plano **Lemur (Free)**
2. Copie a **AMQP URL** (formato `amqps://user:password@host/vhost`)
3. Essa URL será usada como `RABBITMQ_URL` no Backend e no Worker

---

### 3. Adicione o serviço Backend

- Conecte ao repositório GitHub
- **Dockerfile Path:** `Dockerfile`
- **Root Directory:** _(vazio / raiz)_
- Configure as variáveis de ambiente:

| Variável                | Valor                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`          | URL do PostgreSQL Railway (disponível nas variáveis do serviço Postgres) |
| `RABBITMQ_URL`          | AMQP URL do CloudAMQP                                                    |
| `JWT_SECRET`            | String aleatória segura                                                  |
| `VITE_GOOGLE_CLIENT_ID` | Client ID do Google OAuth                                                |
| `TMDB_API_KEY`          | Chave da API TMDB                                                        |
| `RAWG_API_KEY`          | Chave da API RAWG                                                        |

Após o primeiro deploy, o Railway irá gerar um domínio público para o Backend (ex: `https://meu-projeto-backend.up.railway.app`). Guarde essa URL para o próximo passo.

---

### 4. Adicione o serviço Worker

- Conecte ao mesmo repositório GitHub
- **Dockerfile Path:** `worker/Dockerfile` ← **obrigatório, senão o Railway usa o Dockerfile errado**
- **Root Directory:** _(vazio / raiz)_
- Configure as mesmas variáveis do Backend **mais**:

| Variável         | Valor                       |
| ---------------- | --------------------------- |
| `DATABASE_URL`   | Mesma do Backend            |
| `RABBITMQ_URL`   | Mesma AMQP URL do CloudAMQP |
| `JWT_SECRET`     | Mesmo valor do Backend      |
| `GEMINI_API_KEY` | Chave da API Gemini         |
| `RESEND_API_KEY` | Chave da API Resend         |

> **Atenção:** Se o campo Dockerfile Path estiver bloqueado na UI, vá em **Settings → Build → Config File Path** e informe `worker/railway.toml`. O arquivo já está configurado corretamente no repositório.

> **Atenção Resend:** no plano gratuito, e-mails só são entregues para o endereço cadastrado na sua conta Resend. Para testes, crie uma review com o mesmo e-mail da conta Resend.

---

### 5. Adicione o serviço Frontend

- Conecte ao mesmo repositório GitHub
- **Root Directory:** `frontend`
- **Dockerfile Path:** `Dockerfile`
- Configure as variáveis de ambiente:

| Variável                | Valor                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | Mesmo Client ID do Google OAuth                                                                |
| `VITE_API_URL`          | URL pública do Backend + `/graphql` (ex: `https://meu-projeto-backend.up.railway.app/graphql`) |

> **Por que `VITE_API_URL`?** No Railway não existe a rede Docker interna — o nginx não consegue resolver o hostname `backend`. Com `VITE_API_URL` configurado, o Apollo Client chama o backend diretamente pela URL pública, ignorando o proxy nginx.

Após o deploy, Railway gera um domínio para o Frontend. Copie essa URL.

---

### 6. Configure o Google OAuth para o Railway

No [Google Cloud Console](https://console.cloud.google.com):

1. Vá em **APIs e Serviços → Credenciais** e edite o Client ID OAuth
2. Em **Origens JavaScript autorizadas**, adicione a URL do Frontend Railway (ex: `https://meu-projeto-frontend.up.railway.app`)
3. Salve

---

### 7. Sincronize o catálogo

Após todos os serviços estarem Online, faça login no Frontend e clique em **Importar** em cada aba (Filmes, Séries, Livros, Jogos) para popular o banco com dados reais das APIs externas.

---

### Variáveis resumidas por serviço

| Variável                | Backend | Worker | Frontend |
| ----------------------- | :-----: | :----: | :------: |
| `DATABASE_URL`          |   ✅    |   ✅   |          |
| `RABBITMQ_URL`          |   ✅    |   ✅   |          |
| `JWT_SECRET`            |   ✅    |   ✅   |          |
| `TMDB_API_KEY`          |   ✅    |        |          |
| `RAWG_API_KEY`          |   ✅    |        |          |
| `GEMINI_API_KEY`        |         |   ✅   |          |
| `RESEND_API_KEY`        |         |   ✅   |          |
| `VITE_GOOGLE_CLIENT_ID` |   ✅    |        |    ✅    |
| `VITE_API_URL`          |         |        |    ✅    |

---

## Obtendo as Chaves de API

Todas as chaves são **opcionais**. O sistema possui fallback automático quando não configuradas.

### `TMDB_API_KEY` — Filmes e Séries

Usado para buscar filmes e séries em tendência via The Movie Database.

1. Crie uma conta em **themoviedb.org**
2. Vá em **Settings → API → Create → Developer**
3. Preencha o formulário (pode informar "uso pessoal/acadêmico")
4. Copie a **API Key (v3 auth)**

Gratuita, sem limite significativo para uso em desenvolvimento.

**Sem essa chave:** carrega 10 filmes e 10 séries mockados (Inception, The Matrix, Breaking Bad, etc.)

---

### `RAWG_API_KEY` — Jogos

Usado para buscar os jogos mais bem avaliados via RAWG.

1. Crie uma conta em **rawg.io/apidocs**
2. Clique em **"Get API Key"**
3. A chave é gerada imediatamente no painel

Gratuita até 20.000 requisições/mês.

**Sem essa chave:** carrega 10 jogos mockados (The Witcher 3, Elden Ring, Minecraft, etc.)

---

### `RESEND_API_KEY` — Envio de E-mails

Usado pelo worker para enviar um e-mail de confirmação ao usuário após ele publicar uma avaliação.

1. Crie uma conta gratuita em **resend.com**
2. Vá em **API Keys → Create API Key**
3. Copie a chave gerada (começa com `re_`)

Plano gratuito: 3.000 e-mails/mês, 100/dia. Não requer cartão de crédito.

**Sem essa chave:** o worker imprime o conteúdo do e-mail no console do container, sem enviá-lo.

---

### `GEMINI_API_KEY` — Sugestões de IA

Usado pelo worker para gerar recomendações de títulos similares ao que foi avaliado.

1. Acesse **aistudio.google.com**
2. Clique em **"Get API key"**
3. Copie a chave (começa com `AIza` ou `AQ`)

Gratuito, sem cartão de crédito. Modelo utilizado: `gemini-2.5-flash`.

**Sem essa chave:** exibe uma mensagem genérica sugerindo que o usuário pesquise títulos similares.

---

### `VITE_GOOGLE_CLIENT_ID` — Login com Google

Usado para exibir o botão real de "Entrar com Google" na tela de login.

1. Acesse **console.cloud.google.com**
2. Crie ou selecione um projeto
3. Vá em **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth 2.0**
4. Tipo de aplicativo: **Aplicativo da Web**
5. Origens JavaScript autorizadas: `http://localhost`
6. Copie o **ID do cliente** (termina com `.apps.googleusercontent.com`)

> Esta variável deve estar no arquivo `.env` da **raiz** do projeto (`ReviewAPI/.env`), pois é lida pelo Docker Compose durante o build do frontend.

**Sem essa chave:** o botão "Entrar com Google" não aparece; o login continua funcionando normalmente via e-mail e senha.

---

### `JWT_SECRET` — Segredo do Token

Não requer cadastro em nenhum serviço. Gere uma string aleatória segura:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole o resultado no campo `JWT_SECRET` do seu `.env`.

---

## Fluxo Completo de Uso

```
Usuário acessa http://localhost
        │
        ▼
1. CADASTRO / LOGIN
   Preenche nome, e-mail e senha, ou clica em "Entrar com Google"
   Backend valida com Zod, faz hash com bcrypt e retorna um JWT
   Token salvo no localStorage do browser
        │
        ▼
2. DASHBOARD (catálogo inicialmente vazio)
   Seleciona aba: Filmes | Séries | Livros | Jogos
        │
        ▼
3. IMPORTAR CATÁLOGO  →  mutation syncCatalog
   Backend busca dados em APIs externas (ou usa mocks embutidos)
   Salva no PostgreSQL via upsert (sem duplicatas)
   Catálogo aparece como cards na tela
        │
        ▼
4. EXPLORAR MÍDIA
   Clica "Ver Detalhes" em qualquer card
        │
        ▼
5. PÁGINA DE DETALHE
   Vê título, sinopse/autor/desenvolvedora
   Vê nota média e avaliações de outros usuários
   Seleciona estrelas + escreve comentário → mutation createReview
        │                │
        │                └──► backend publica evento no RabbitMQ
        │                          │
        │                          ▼
        │                     Worker processa:
        │                     1. Chama Gemini API → 4 sugestões personalizadas
        │                     2. Envia e-mail via Resend com as sugestões
        │                     3. Gera PDF com resumo da review
        ▼
6. PERFIL  →  query myReviews
   Lista todas as suas avaliações com link para a mídia
   Pode excluir qualquer uma → mutation deleteReview (soft-delete)
```

---

## Autenticação

### Cadastro

Campos: **Nome**, **E-mail**, **Senha** (mínimo 6 caracteres).

```graphql
mutation {
  register(
    input: {
      name: "José Arthur"
      email: "jose@exemplo.com"
      password: "senha123"
    }
  ) {
    accessToken
    user {
      id
      name
      email
    }
  }
}
```

### Login com senha

```graphql
mutation {
  login(input: { email: "jose@exemplo.com", password: "senha123" }) {
    accessToken
    user {
      id
      name
      email
    }
  }
}
```

### Login com Google (real)

O frontend exibe um botão oficial do Google via `@react-oauth/google`. Ao clicar, o Google retorna um `id_token` real que é enviado ao backend. O backend valida o token na API do Google (`oauth2.googleapis.com/tokeninfo`), extrai o e-mail e nome, registra o usuário automaticamente caso não exista, e retorna o JWT.

```graphql
mutation {
  loginOAuth(
    input: { token: "<id_token_real_do_google>", provider: "google" }
  ) {
    accessToken
    user {
      id
      name
      email
    }
  }
}
```

> O botão só aparece se `VITE_GOOGLE_CLIENT_ID` estiver configurado no `.env`.

---

## Catálogo e Dados Mockados

O banco começa **vazio**. É preciso clicar em "Importar" no dashboard para popular cada tipo de mídia.

### Como o `syncCatalog` funciona

| Tipo   | API real                             | Variável de ambiente | Mocks embutidos (10 itens)                                                                                                                          |
| ------ | ------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filmes | TMDB trending movies                 | `TMDB_API_KEY`       | Inception, The Matrix, Interstellar, Pulp Fiction, The Dark Knight, Spirited Away, Parasite, Whiplash, Gladiator, Spider-Man: Into the Spider-Verse |
| Séries | TMDB trending TV                     | `TMDB_API_KEY`       | Breaking Bad, Game of Thrones, Stranger Things, Chernobyl, The Office, Rick and Morty, Black Mirror, Better Call Saul, Sherlock, The Last of Us     |
| Livros | Open Library `/subjects/programming` | _(sem chave)_        | Clean Code, The Hobbit, Harry Potter, 1984, Dune, Sapiens, Refactoring, Atomic Habits, Designing Data-Intensive Applications, Crime and Punishment  |
| Jogos  | RAWG API                             | `RAWG_API_KEY`       | The Witcher 3, Elden Ring, Minecraft, GTA V, Red Dead Redemption 2, Zelda: BotW, Portal 2, Hades, Cyberpunk 2077, God of War                        |

O sync usa `upsert` pelo campo `externalId` — clicar em "Importar" múltiplas vezes é seguro, nunca duplica registros.

### Exemplo via Playground

```graphql
# Adicione o header: Authorization: Bearer <seu_token>
mutation {
  syncCatalog(mediaType: "filme") {
    success
    count
    message
  }
}
```

Valores válidos para `mediaType`: `"filme"` · `"serie"` · `"livro"` · `"jogo"`

---

## API GraphQL — Referência

### Uso autenticado no Playground

No Playground (`http://localhost:3000/graphql`), clique em **"HTTP HEADERS"** (canto inferior) e cole:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsIn..."
}
```

### Avaliações

**Criar avaliação** (requer JWT — vincule a exatamente um tipo de mídia):

```graphql
mutation {
  createReview(
    input: {
      score: 5
      content: "Obra-prima do cinema moderno."
      filmeId: 1 # ou serieId, livroId, jogoId
    }
  ) {
    id
    score
    content
    createdAt
  }
}
```

**Avaliações de uma mídia** (público):

```graphql
query {
  reviewsByMedia(filmeId: 1) {
    id
    score
    content
    createdAt
    user {
      name
      email
    }
  }
}
```

**Minhas avaliações** (requer JWT):

```graphql
query {
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
```

**Excluir avaliação** (requer JWT — soft-delete, marca `isDeleted: true` no banco):

```graphql
mutation {
  deleteReview(reviewId: 1) {
    id
  }
}
```

---

## Worker RabbitMQ

O worker é uma aplicação NestJS separada que roda dentro do Docker Compose como container independente (`review-worker`). Ele não expõe porta HTTP — apenas consome eventos da fila RabbitMQ.

### O que ele faz

Quando uma review é criada, o backend publica um evento `review_created` com os dados da avaliação. O worker consome esse evento e:

1. **Sugestões de IA (Gemini)** — chama o Google Gemini 2.5 Flash para gerar 4 títulos similares famosos, com motivo em uma frase curta cada. Se a chave não estiver configurada, usa texto genérico.
2. **E-mail (Resend)** — envia confirmação ao usuário com nota, conteúdo da review e as sugestões da IA. Se a chave não estiver configurada, imprime no console.
3. **PDF (pdfkit)** — gera um arquivo de relatório em PDF com o resumo da review e a sugestão.

### Build e execução fora do Docker (desenvolvimento)

```bash
# Compilar apenas o worker
npm run build:worker

# Rodar em produção
npm run start:worker:prod

# Rodar em modo desenvolvimento (ts-node)
npm run start:worker
```

> O worker precisa que o RabbitMQ esteja acessível. Com o Docker Compose rodando, ele está disponível em `amqp://guest:guest@localhost:5672`.

---

## Banco de Dados

### Modelos Prisma

```
User    (id, name, email, password, createdAt)
  └── Review[]

Filme   (id, titulo, sinopse?, externalId único)
Serie   (id, titulo, sinopse?, externalId único)
Livro   (id, titulo, autor?,   externalId único)
Jogo    (id, titulo, desenvolvedora?, externalId único)
  └── Review[] cada um

Review  (id, userId, filmeId?, serieId?, livroId?, jogoId?,
         score, content, isDeleted, createdAt)
```

### Inicialização automática

Ao subir o container, o `CMD` executa:

```bash
npx prisma db push --accept-data-loss && node dist/main
```

O `prisma db push` sincroniza o `schema.prisma` com o PostgreSQL na primeira execução, criando todas as tabelas sem migrations.

---

## Arquitetura de Rede no Docker

```
Browser (porta 80)
       │
       ▼
   nginx (frontend container)
       │
       ├── GET /  →  serve index.html (React SPA)
       ├── GET /dashboard, /detail/*, /profile  →  serve index.html
       │
       └── POST /graphql  ─────────────────────────────────────────────►
                                                                         │
                                                            NestJS API (:3000)
                                                                         │
                                                    ┌────────────────────┼──────────────────┐
                                                    ▼                    ▼                  ▼
                                               PostgreSQL            RabbitMQ          APIs Externas
                                            (review-postgres)   (review-rabbitmq)    (TMDB, RAWG, OL)
                                                                         │
                                                                         ▼
                                                                   Worker NestJS
                                                                (review-worker)
                                                                Gemini · Resend · PDF
```

O frontend usa sempre o path relativo `/graphql`. O nginx intercepta e encaminha para `http://backend:3000/graphql` internamente — o browser nunca precisa conhecer a porta `3000`.

---

## Estrutura de Pastas

```
ReviewAPI/                            ← raiz do repositório git
├── .env.example                      ← template de variáveis de ambiente
├── .gitignore
├── .dockerignore
├── .prettierrc
├── Dockerfile                        ← build do backend (NestJS)
├── docker-compose.yml                ← orquestração dos 5 containers
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json               ← rootDir: ./src (exclui worker/)
│
├── prisma/
│   └── schema.prisma                 ← modelos User, Filme, Serie, Livro, Jogo, Review
│
├── src/                              ← código-fonte do backend
│   ├── main.ts                       ← bootstrap + CORS + ZodValidationPipe global
│   ├── app.module.ts                 ← registro de todos os módulos
│   ├── Auth/                         ← JWT strategy, guards, resolver de login/registro/OAuth
│   │   └── dto/                      ← RegisterInput, LoginInput, LoginOAuthInput
│   ├── Catalog/                      ← mutation syncCatalog + integrações com APIs externas
│   ├── Movie/                        ← resolver, service, type de Filmes
│   ├── Serie/                        ← resolver, service, type de Séries
│   ├── Book/                         ← resolver, service, type de Livros
│   ├── Game/                         ← resolver, service, type de Jogos
│   ├── Review/                       ← resolver, service, type + relações
│   │   └── dto/                      ← CreateReviewInput, UpdateReviewInput
│   ├── User/                         ← entidade User + PrismaUserRepository
│   ├── Shared/                       ← value objects: Email, Password
│   ├── Enter/                        ← RegisterUseCase (lógica de domínio)
│   ├── Interface/                    ← interfaces: IUserRepository, IReviewService, etc.
│   ├── prisma/                       ← PrismaService + PrismaModule
│   ├── rabbitmq/                     ← RabbitMQModule (publisher de eventos)
│   └── validation/                   ← ZodValidationPipe + schemas de validação
│
├── worker/                           ← worker NestJS (consumidor RabbitMQ)
│   ├── Dockerfile                    ← build independente do worker
│   ├── tsconfig.json                 ← build independente → ../dist-worker
│   ├── shared/
│   │   └── queue.constants.ts        ← tipos e nomes de filas compartilhados
│   └── src/
│       ├── main.ts                   ← bootstrap do worker (sem servidor HTTP)
│       ├── worker.module.ts
│       ├── consumers/
│       │   └── review.consumer.ts    ← ouve fila review_created
│       └── services/
│           ├── ai.service.ts         ← sugestões via Google Gemini 2.5 Flash
│           ├── email.service.ts      ← e-mail via Resend API (fallback: console)
│           └── pdf.service.ts        ← relatório em PDF (pdfkit)
│
└── frontend/                         ← interface React + Vite
    ├── Dockerfile                    ← build do frontend + nginx (ARG para VITE_*)
    ├── .dockerignore                 ← exclui arquivos .js compilados do contexto Docker
    ├── nginx.conf                    ← proxy /graphql → backend:3000
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig*.json
    └── src/
        ├── main.tsx                  ← GoogleOAuthProvider + Apollo + React root
        ├── App.tsx                   ← rotas + ProtectedRoute + PublicRoute
        ├── graphql/
        │   ├── client.ts             ← Apollo Client (uri relativa /graphql em prod)
        │   └── queries.ts            ← todas as queries e mutations GraphQL
        └── pages/
            ├── Login.tsx             ← cadastro / login / botão Google real
            ├── Dashboard.tsx         ← catálogo com abas e botão Importar
            ├── Detail.tsx            ← detalhes da mídia + reviews + formulário
            └── Profile.tsx           ← minhas reviews + excluir
```
