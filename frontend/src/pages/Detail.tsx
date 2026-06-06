import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_MOVIES, 
  GET_SERIES, 
  GET_BOOKS, 
  GET_GAMES, 
  GET_REVIEWS_BY_MEDIA,
  CREATE_REVIEW_MUTATION
} from '../graphql/queries';
import { Star, ArrowLeft, Send, LogOut, User as UserIcon } from 'lucide-react';

export default function Detail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const mediaId = parseInt(id || '0', 10);
  const navigate = useNavigate();

  const [score, setScore] = useState(5);
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch the full catalog of the type to locate our specific item details
  const { data: moviesData } = useQuery(GET_MOVIES, { skip: type !== 'filme' });
  const { data: seriesData } = useQuery(GET_SERIES, { skip: type !== 'serie' });
  const { data: booksData } = useQuery(GET_BOOKS, { skip: type !== 'livro' });
  const { data: gamesData } = useQuery(GET_GAMES, { skip: type !== 'jogo' });

  // Fetch Reviews
  const variables: any = {};
  if (type === 'filme') variables.filmeId = mediaId;
  else if (type === 'serie') variables.serieId = mediaId;
  else if (type === 'livro') variables.livroId = mediaId;
  else if (type === 'jogo') variables.jogoId = mediaId;

  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useQuery(GET_REVIEWS_BY_MEDIA, {
    variables,
    skip: !type || !mediaId,
  });

  // Create Review Mutation
  const [createReview, { loading: submitLoading }] = useMutation(CREATE_REVIEW_MUTATION);

  // Extract active item details
  let item: any = null;
  if (type === 'filme') {
    item = moviesData?.movies?.find((m: any) => m.id === String(mediaId));
  } else if (type === 'serie') {
    item = seriesData?.series?.find((s: any) => s.id === String(mediaId));
  } else if (type === 'livro') {
    item = booksData?.books?.find((b: any) => b.id === String(mediaId));
  } else if (type === 'jogo') {
    item = gamesData?.games?.find((g: any) => g.id === String(mediaId));
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getUserName = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr).name;
      } catch {
        return 'Usuário';
      }
    }
    return 'Usuário';
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!content.trim()) {
      setErrorMsg('Escreva um comentário para sua avaliação.');
      return;
    }

    try {
      await createReview({
        variables: {
          input: { score, content, ...variables },
        }
      });
      setSuccessMsg('Avaliação enviada com sucesso!');
      setContent('');
      setScore(5);
      refetchReviews();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar avaliação.');
    }
  };

  const reviews = reviewsData?.reviewsByMedia || [];
  const averageScore = reviews.length > 0
    ? (reviews.reduce((acc: number, r: any) => acc + r.score, 0) / reviews.length).toFixed(1)
    : null;

  if (!item) {
    return (
      <div className="app-container">
        <Link to="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Item não encontrado</h2>
          <p>Não foi possível carregar as informações do item selecionado.</p>
        </div>
      </div>
    );
  }

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

      <Link to="/dashboard" className="btn btn-secondary" style={{ marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Voltar ao Painel
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(280px, 1.2fr)', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Side: Media details & Average score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-card">
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{item.titulo}</h2>
            {type === 'livro' && <div className="media-card-subtitle" style={{ fontSize: '1.1rem' }}>Autor: {item.autor || 'Desconhecido'}</div>}
            {type === 'jogo' && <div className="media-card-subtitle" style={{ fontSize: '1.1rem' }}>Desenvolvedora: {item.desenvolvedora || 'Desconhecida'}</div>}
            
            <div style={{ margin: '20px 0', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Código Externo</h3>
              <p style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.externalId}</p>
            </div>

            {item.sinopse && (
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Sinopse</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.sinopse}</p>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Avaliação Geral</h3>
            {averageScore ? (
              <>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  {averageScore} <span style={{ fontSize: '1.5rem', color: 'var(--text-dim)', fontWeight: 500 }}>/5</span>
                </div>
                <div className="stars-container" style={{ margin: '10px 0 15px 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`star ${s <= Math.round(parseFloat(averageScore)) ? 'filled' : ''}`} 
                      size={24}
                      fill={s <= Math.round(parseFloat(averageScore)) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Baseado em {reviews.length} avaliações</p>
              </>
            ) : (
              <p style={{ color: 'var(--text-dim)', padding: '20px 0' }}>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
            )}
          </div>
        </div>

        {/* Right Side: Reviews lists & Add Review form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Add Review Form */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>Deixe sua avaliação</h3>
            
            {errorMsg && <div className="error-badge">{errorMsg}</div>}
            {successMsg && <div className="success-badge">{successMsg}</div>}

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group" style={{ alignItems: 'flex-start' }}>
                <label className="form-label">Sua Nota</label>
                <div className="stars-container" style={{ gap: '10px', margin: '5px 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s}
                      className={`star star-interactive ${s <= score ? 'filled' : ''}`}
                      fill={s <= score ? 'currentColor' : 'none'}
                      size={32}
                      onClick={() => setScore(s)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comentário</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Escreva o que você achou dessa mídia..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={submitLoading}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitLoading}>
                <Send size={16} />
                {submitLoading ? 'Enviando...' : 'Publicar Avaliação'}
              </button>
            </form>
          </div>

          {/* Reviews Feed */}
          <div className="reviews-section">
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px' }}>
              Opinião dos Usuários ({reviews.length})
            </h3>
            
            {reviewsLoading ? (
              <div style={{ color: 'var(--text-dim)', padding: '20px 0' }}>Carregando avaliações...</div>
            ) : reviews.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', marginTop: '20px' }}>
                Nenhum comentário publicado.
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="glass-card review-item">
                    <div className="review-header">
                      <div>
                        <span className="review-author">{rev.user?.name}</span>
                        <span className="review-meta" style={{ marginLeft: '10px' }}>
                          ({rev.user?.email})
                        </span>
                      </div>
                      <div className="stars-container">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`star ${s <= rev.score ? 'filled' : ''}`} 
                            size={16}
                            fill={s <= rev.score ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="review-content">{rev.content}</p>
                    <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
