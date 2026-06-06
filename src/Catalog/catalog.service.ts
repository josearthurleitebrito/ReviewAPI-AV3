import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private prisma: PrismaService) {}

  async syncCatalog(mediaType: string) {
    const type = mediaType.toLowerCase();
    let result: { count: number; usedMock: boolean };

    try {
      if (type === 'filme') {
        result = await this.syncMovies();
      } else if (type === 'serie') {
        result = await this.syncSeries();
      } else if (type === 'livro') {
        result = await this.syncBooks();
      } else if (type === 'jogo') {
        result = await this.syncGames();
      } else {
        return { success: false, count: 0, usedMock: false, message: `Unknown media type: ${mediaType}` };
      }

      const message = result.usedMock
        ? `Sincronizados ${result.count} itens usando dados mockados (API indisponível ou chave não configurada).`
        : `Sincronizados ${result.count} itens da API externa com sucesso.`;

      return { success: true, count: result.count, usedMock: result.usedMock, message };
    } catch (error) {
      this.logger.error(`Error syncing catalog for ${type}: ${error.message}`);
      return { success: false, count: 0, usedMock: false, message: `Sync failed: ${error.message}` };
    }
  }

  private async syncMovies(): Promise<{ count: number; usedMock: boolean }> {
    const apiKey = process.env.TMDB_API_KEY;
    let movies: { title: string; overview: string; id: string }[] = [];
    let usedMock = false;

    if (apiKey && !apiKey.startsWith('your_')) {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
        if (res.ok) {
          const data = await res.json();
          movies = data.results.slice(0, 10).map((m: any) => ({
            title: m.title || m.original_title,
            overview: m.overview || '',
            id: `tmdb_${m.id}`,
          }));
        } else {
          this.logger.warn(`TMDB API returned ${res.status}. Falling back to mocks.`);
        }
      } catch (err) {
        this.logger.warn(`Failed fetching TMDB API: ${err.message}. Falling back to mocks.`);
      }
    } else {
      this.logger.warn('TMDB_API_KEY not configured. Using mock movies.');
    }

    if (movies.length === 0) {
      usedMock = true;
      movies = [
        { title: 'Inception', overview: 'A thief who steals corporate secrets through the use of dream-sharing technology.', id: 'mock_movie_1' },
        { title: 'The Matrix', overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality.', id: 'mock_movie_2' },
        { title: 'Interstellar', overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', id: 'mock_movie_3' },
        { title: 'Pulp Fiction', overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine.', id: 'mock_movie_4' },
        { title: 'The Dark Knight', overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.', id: 'mock_movie_5' },
        { title: 'Spirited Away', overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods.', id: 'mock_movie_6' },
        { title: 'Parasite', overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', id: 'mock_movie_7' },
        { title: 'Whiplash', overview: 'A promising young drummer enrolls at a cut-throat music conservatory.', id: 'mock_movie_8' },
        { title: 'Gladiator', overview: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.', id: 'mock_movie_9' },
        { title: 'Spider-Man: Into the Spider-Verse', overview: 'Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals.', id: 'mock_movie_10' }
      ];
    }

    let count = 0;
    for (const m of movies) {
      await this.prisma.filme.upsert({
        where: { externalId: m.id },
        update: { titulo: m.title, sinopse: m.overview },
        create: { externalId: m.id, titulo: m.title, sinopse: m.overview },
      });
      count++;
    }
    return { count, usedMock };
  }

  private async syncSeries(): Promise<{ count: number; usedMock: boolean }> {
    const apiKey = process.env.TMDB_API_KEY;
    let series: { title: string; overview: string; id: string }[] = [];
    let usedMock = false;

    if (apiKey && !apiKey.startsWith('your_')) {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`);
        if (res.ok) {
          const data = await res.json();
          series = data.results.slice(0, 10).map((s: any) => ({
            title: s.name || s.original_name,
            overview: s.overview || '',
            id: `tmdb_tv_${s.id}`,
          }));
        } else {
          this.logger.warn(`TMDB TV API returned ${res.status}. Falling back to mocks.`);
        }
      } catch (err) {
        this.logger.warn(`Failed fetching TMDB TV API: ${err.message}. Falling back to mocks.`);
      }
    } else {
      this.logger.warn('TMDB_API_KEY not configured. Using mock series.');
    }

    if (series.length === 0) {
      usedMock = true;
      series = [
        { title: 'Breaking Bad', overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.', id: 'mock_tv_1' },
        { title: 'Game of Thrones', overview: 'Nine noble families fight for control over the lands of Westeros.', id: 'mock_tv_2' },
        { title: 'Stranger Things', overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.', id: 'mock_tv_3' },
        { title: 'Chernobyl', overview: 'The dramatization of the 1986 nuclear accident, one of the worst human-made catastrophes.', id: 'mock_tv_4' },
        { title: 'The Office', overview: 'A mockumentary on a group of typical office workers, where the workday is consists of ego clashes.', id: 'mock_tv_5' },
        { title: 'Rick and Morty', overview: 'An animated series that follows the exploits of a super scientist and his easily influenced grandson.', id: 'mock_tv_6' },
        { title: 'Black Mirror', overview: 'An anthology series exploring a twisted, high-tech multiverse.', id: 'mock_tv_7' },
        { title: 'Better Call Saul', overview: 'The trials and tribulations of criminal attorney Jimmy McGill in the years leading up to Breaking Bad.', id: 'mock_tv_8' },
        { title: 'Sherlock', overview: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.', id: 'mock_tv_9' },
        { title: 'The Last of Us', overview: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl.', id: 'mock_tv_10' }
      ];
    }

    let count = 0;
    for (const s of series) {
      await this.prisma.serie.upsert({
        where: { externalId: s.id },
        update: { titulo: s.title, sinopse: s.overview },
        create: { externalId: s.id, titulo: s.title, sinopse: s.overview },
      });
      count++;
    }
    return { count, usedMock };
  }

  private async syncBooks(): Promise<{ count: number; usedMock: boolean }> {
    let books: { title: string; author: string; id: string }[] = [];
    let usedMock = false;

    try {
      const res = await fetch('https://openlibrary.org/subjects/programming.json?limit=15');
      if (res.ok) {
        const data = await res.json();
        books = data.works.slice(0, 10).map((b: any) => ({
          title: b.title,
          author: b.authors && b.authors[0] ? b.authors[0].name : 'Unknown Author',
          id: `ol_${b.key.replace('/works/', '')}`,
        }));
      } else {
        this.logger.warn(`Open Library returned ${res.status}. Falling back to mocks.`);
      }
    } catch (err) {
      this.logger.warn(`Failed fetching Open Library: ${err.message}. Falling back to mocks.`);
    }

    if (books.length === 0) {
      usedMock = true;
      books = [
        { title: 'Clean Code', author: 'Robert C. Martin', id: 'mock_book_1' },
        { title: 'The Hobbit', author: 'J.R.R. Tolkien', id: 'mock_book_2' },
        { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', id: 'mock_book_3' },
        { title: '1984', author: 'George Orwell', id: 'mock_book_4' },
        { title: 'Dune', author: 'Frank Herbert', id: 'mock_book_5' },
        { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', id: 'mock_book_6' },
        { title: 'Refactoring', author: 'Martin Fowler', id: 'mock_book_7' },
        { title: 'Atomic Habits', author: 'James Clear', id: 'mock_book_8' },
        { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', id: 'mock_book_9' },
        { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', id: 'mock_book_10' }
      ];
    }

    let count = 0;
    for (const b of books) {
      await this.prisma.livro.upsert({
        where: { externalId: b.id },
        update: { titulo: b.title, autor: b.author },
        create: { externalId: b.id, titulo: b.title, autor: b.author },
      });
      count++;
    }
    return { count, usedMock };
  }

  private async syncGames(): Promise<{ count: number; usedMock: boolean }> {
    const apiKey = process.env.RAWG_API_KEY;
    let games: { title: string; developer: string; id: string }[] = [];
    let usedMock = false;

    if (apiKey && !apiKey.startsWith('your_')) {
      try {
        const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page_size=10`);
        if (res.ok) {
          const data = await res.json();
          games = data.results.map((g: any) => ({
            title: g.name,
            developer: 'Various',
            id: `rawg_${g.id}`,
          }));
        } else {
          this.logger.warn(`RAWG API returned ${res.status}. Falling back to mocks.`);
        }
      } catch (err) {
        this.logger.warn(`Failed fetching RAWG API: ${err.message}. Falling back to mocks.`);
      }
    } else {
      this.logger.warn('RAWG_API_KEY not configured. Using mock games.');
    }

    if (games.length === 0) {
      usedMock = true;
      games = [
        { title: 'The Witcher 3: Wild Hunt', developer: 'CD Projekt Red', id: 'mock_game_1' },
        { title: 'Elden Ring', developer: 'FromSoftware', id: 'mock_game_2' },
        { title: 'Minecraft', developer: 'Mojang Studios', id: 'mock_game_3' },
        { title: 'Grand Theft Auto V', developer: 'Rockstar Games', id: 'mock_game_4' },
        { title: 'Red Dead Redemption 2', developer: 'Rockstar Games', id: 'mock_game_5' },
        { title: 'The Legend of Zelda: Breath of the Wild', developer: 'Nintendo', id: 'mock_game_6' },
        { title: 'Portal 2', developer: 'Valve', id: 'mock_game_7' },
        { title: 'Hades', developer: 'Supergiant Games', id: 'mock_game_8' },
        { title: 'Cyberpunk 2077', developer: 'CD Projekt Red', id: 'mock_game_9' },
        { title: 'God of War (2018)', developer: 'Santa Monica Studio', id: 'mock_game_10' }
      ];
    }

    let count = 0;
    for (const g of games) {
      await this.prisma.jogo.upsert({
        where: { externalId: g.id },
        update: { titulo: g.title, desenvolvedora: g.developer },
        create: { externalId: g.id, titulo: g.title, desenvolvedora: g.developer },
      });
      count++;
    }
    return { count, usedMock };
  }
}
