import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GET_MOVIES, 
  GET_SERIES, 
  GET_BOOKS, 
  GET_GAMES, 
  SYNC_CATALOG_MUTATION 
} from '../graphql/queries';
import { RefreshCw, Search, LogOut, User as UserIcon } from 'lucide-react';

type Tab = 'filme' | 'serie' | 'livro' | 'jogo';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('filme');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Queries
  const { data: moviesData, loading: moviesLoading, refetch: refetchMovies } = useQuery(GET_MOVIES, { skip: activeTab !== 'filme' });
  const { data: seriesData, loading: seriesLoading, refetch: refetchSeries } = useQuery(GET_SERIES, { skip: activeTab !== 'serie' });
  const { data: booksData, loading: booksLoading, refetch: refetchBooks } = useQuery(GET_BOOKS, { skip: activeTab !== 'livro' });
  const { data: gamesData, loading: gamesLoading, refetch: refetchGames } = useQuery(GET_GAMES, { skip: activeTab !== 'jogo' });

  // Sync Mutation
  const [syncCatalog, { loading: syncLoading }] = useMutation(SYNC_CATALOG_MUTATION);

  const handleSync = async () => {
    setSyncStatus({ type: '', text: '' });
    try {
      const { data } = await syncCatalog({ variables: { mediaType: activeTab } });
      if (data?.syncCatalog?.success) {
        const statusType = data.syncCatalog.usedMock ? 'warning' : 'success';
        setSyncStatus({ type: statusType, text: data.syncCatalog.message });
        if (activeTab === 'filme') refetchMovies();
        else if (activeTab === 'serie') refetchSeries();
        else if (activeTab === 'livro') refetchBooks();
        else if (activeTab === 'jogo') refetchGames();
      } else {
        setSyncStatus({ type: 'error', text: data?.syncCatalog?.message || 'Falha ao sincronizar o catálogo.' });
      }
    } catch (err: any) {
      setSyncStatus({ type: 'error', text: err.message || 'Erro na requisição.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getUserName = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        return u.name;
      } catch {
        return 'Usuário';
      }
    }
    return 'Usuário';
  };

  // Get active items list
  let items: any[] = [];
  let loading = false;

  if (activeTab === 'filme') {
    items = moviesData?.movies || [];
    loading = moviesLoading;
  } else if (activeTab === 'serie') {
    items = seriesData?.series || [];
    loading = seriesLoading;
  } else if (activeTab === 'livro') {
    items = booksData?.books || [];
    loading = booksLoading;
  } else if (activeTab === 'jogo') {
    items = gamesData?.games || [];
    loading = gamesLoading;
  }

  // Filter items by search query
  const filteredItems = items.filter(item => {
    const titleMatch = item.titulo?.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = item.autor?.toLowerCase().includes(searchQuery.toLowerCase());
    const devMatch = item.desenvolvedora?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || authorMatch || devMatch;
  });

  return (
    <div className="app-container animate-fade-in">
      {/* Header / Navbar */}
      <header className="navbar">
        <Link to="/dashboard" className="nav-logo">
          AV3 Reviews
        </Link>
        <div className="nav-links">
          <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserIcon size={16} />
            {getUserName()}
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </header>

      {/* Control Actions & Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'filme' ? 'active' : ''}`}
            onClick={() => { setActiveTab('filme'); setSearchQuery(''); setSyncStatus({ type: '', text: '' }); }}
          >
            Filmes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'serie' ? 'active' : ''}`}
            onClick={() => { setActiveTab('serie'); setSearchQuery(''); setSyncStatus({ type: '', text: '' }); }}
          >
            Séries
          </button>
          <button 
            className={`tab-btn ${activeTab === 'livro' ? 'active' : ''}`}
            onClick={() => { setActiveTab('livro'); setSearchQuery(''); setSyncStatus({ type: '', text: '' }); }}
          >
            Livros
          </button>
          <button 
            className={`tab-btn ${activeTab === 'jogo' ? 'active' : ''}`}
            onClick={() => { setActiveTab('jogo'); setSearchQuery(''); setSyncStatus({ type: '', text: '' }); }}
          >
            Jogos
          </button>
        </div>

        <button 
          onClick={handleSync} 
          className="btn btn-primary"
          disabled={syncLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={syncLoading ? 'animate-spin' : ''} />
          {syncLoading ? 'Sincronizando...' : `Importar ${activeTab === 'filme' ? 'Filmes' : activeTab === 'serie' ? 'Séries' : activeTab === 'livro' ? 'Livros' : 'Jogos'}`}
        </button>
      </div>

      {/* Sync Status Badge */}
      {syncStatus.text && (
        <div className={
          syncStatus.type === 'success' ? 'success-badge' :
          syncStatus.type === 'warning' ? 'warning-badge' :
          'error-badge'
        }>
          {syncStatus.text}
        </div>
      )}

      {/* Search Field */}
      <div className="search-bar">
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder={`Buscar por título, ${activeTab === 'livro' ? 'autor' : activeTab === 'jogo' ? 'desenvolvedora' : 'descrição'}...`} 
            style={{ paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Carregando itens do catálogo...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Nenhum item encontrado no banco local. Clique em "Importar" para buscar o catálogo externo!
        </div>
      ) : (
        <div className="media-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="glass-card media-card">
              <h3 className="media-card-title">{item.titulo}</h3>
              {activeTab === 'livro' && <div className="media-card-subtitle">Autor: {item.autor || 'Desconhecido'}</div>}
              {activeTab === 'jogo' && <div className="media-card-subtitle">Desenvolvedora: {item.desenvolvedora || 'Desconhecida'}</div>}
              {item.sinopse && <p className="media-card-desc">{item.sinopse}</p>}
              <div className="media-card-footer">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>ID: {item.externalId}</span>
                <Link to={`/detail/${activeTab}/${item.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
