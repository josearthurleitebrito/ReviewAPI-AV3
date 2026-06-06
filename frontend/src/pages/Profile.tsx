// Página de perfil do usuário — exibe dados da conta e histórico de avaliações
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { GET_MY_REVIEWS, DELETE_REVIEW_MUTATION } from '../graphql/queries';
import { Star, Trash2, ArrowLeft, LogOut, MessageSquare } from 'lucide-react';

export default function Profile() {
  // Busca todas as avaliações do usuário logado
  const { data: myReviewsData, loading: reviewsLoading, refetch: refetchMyReviews } = useQuery(GET_MY_REVIEWS);
  const [deleteReview, { loading: deleteLoading }] = useMutation(DELETE_REVIEW_MUTATION);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Lê os dados do usuário armazenados no localStorage após o login
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return { name: 'Usuário', email: '' };
      }
    }
    return { name: 'Usuário', email: '' };
  };

  // Confirma e executa o soft-delete da avaliação, depois recarrega a lista
  const handleDelete = async (reviewId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deleteReview({ variables: { reviewId } });
        refetchMyReviews();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir avaliação.');
      }
    }
  };

  const user = getUser();
  const reviews = myReviewsData?.myReviews || [];

  // Determina o título, tipo e caminho de navegação com base no tipo de mídia da review
  const getMediaInfo = (rev: any) => {
    if (rev.filme) return { title: rev.filme.titulo, type: 'Filme', path: `/detail/filme/${rev.filme.id}` };
    if (rev.serie) return { title: rev.serie.titulo, type: 'Série', path: `/detail/serie/${rev.serie.id}` };
    if (rev.livro) return { title: rev.livro.titulo, type: 'Livro', path: `/detail/livro/${rev.livro.id}` };
    if (rev.jogo) return { title: rev.jogo.titulo, type: 'Jogo', path: `/detail/jogo/${rev.jogo.id}` };
    return { title: 'Mídia Excluída', type: 'Desconhecido', path: '#' };
  };

  return (
    <div className="app-container animate-fade-in">
      {/* Barra de navegação superior */}
      <header className="navbar">
        <Link to="/dashboard" className="nav-logo">
          AV3 Reviews
        </Link>
        <div className="nav-links">
          <Link to="/profile" className="nav-link active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserIcon size={16} />
            {user.name}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '40px', alignItems: 'start' }}>

        {/* Card com avatar, nome, email e contagem de avaliações */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
          {/* Avatar gerado com a inicial do nome */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '20px' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '20px' }}>{user.email}</p>

          <div style={{ borderTop: '1px solid var(--border-glass)', width: '100%', paddingTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{reviews.length}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Avaliações</div>
            </div>
          </div>
        </div>

        {/* Lista de avaliações do usuário */}
        <div>
          <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> Minhas Avaliações
          </h3>

          {reviewsLoading ? (
            <div style={{ color: 'var(--text-dim)' }}>Carregando suas avaliações...</div>
          ) : reviews.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
              Você ainda não escreveu nenhuma avaliação. Acesse o catálogo e comece a avaliar!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((rev: any) => {
                const media = getMediaInfo(rev);
                return (
                  <div key={rev.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                      <div>
                        {/* Badge com o tipo de mídia */}
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-glass)', color: 'var(--secondary)', fontWeight: 600, marginRight: '10px' }}>
                          {media.type}
                        </span>
                        <Link to={media.path} style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none' }}>
                          {media.title}
                        </Link>
                      </div>

                      {/* Estrelas representando a nota */}
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

                      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{rev.content}</p>

                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        Postado em: {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Botão para excluir a avaliação (soft-delete) */}
                    <button
                      onClick={() => handleDelete(parseInt(rev.id, 10))}
                      className="btn btn-danger"
                      disabled={deleteLoading}
                      style={{ padding: '10px', borderRadius: '8px' }}
                      title="Excluir avaliação"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Ícone SVG inline de usuário (fallback sem dependência extra)
function UserIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}
