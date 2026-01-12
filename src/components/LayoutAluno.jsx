import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LayoutAluno.css';
import LogoSinFondo from '../assets/LogoSinFondo.svg';

export default function LayoutAluno({ children, exibirMenu = true }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuAberto, setMenuAberto] = useState(true);

  // Determina se estamos na Home do Aluno para aplicar tema diferenciado
  const isStudentHome = location.pathname === '/painel-aluno';
  const sidebarThemeClass = isStudentHome ? 'sidebar-light' : 'sidebar-blue';

  useEffect(() => {
    // Fecha automaticamente em todas as páginas (inclusive início) para ficar recolhido por padrão
    setTimeout(() => setMenuAberto(false), 0);
  }, [location.pathname]);

  const fazerLogout = () => {
    logout();
    navigate('/');
  };

  if (!exibirMenu) return <>{children}</>;

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <aside className={`sidebar ${menuAberto ? 'open' : 'closed'} ${sidebarThemeClass}`}>
        <div className="sidebar-header">
          <h2><img className='sidebar-logo' src={LogoSinFondo} alt="Aqualab Logo" />  Aqualab</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setMenuAberto(!menuAberto)}
            type="button"
            aria-label={menuAberto ? "Colapsar menu" : "Expandir menu"}
          >
            {menuAberto ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            onClick={() => navigate('/painel-aluno')} 
            className={`sidebar-btn ${location.pathname === '/painel-aluno' ? 'active' : ''}`}
            type="button"
          >
            <span className="btn-icon">🏠</span>
            {menuAberto && <span className="btn-text">Início</span>}
          </button>
          <button 
            onClick={() => navigate('/quizzes-aluno')} 
            className={`sidebar-btn ${location.pathname === '/quizzes-aluno' ? 'active' : ''}`}
            type="button"
          >
            <span className="btn-icon">📖</span>
            {menuAberto && <span className="btn-text">Quizzes</span>}
          </button>
          <button 
            onClick={() => navigate('/videos-aluno')} 
            className={`sidebar-btn ${location.pathname === '/videos-aluno' ? 'active' : ''}`}
            type="button"
          >
            <span className="btn-icon">🎬</span>
            {menuAberto && <span className="btn-text">Vídeos</span>}
          </button>
          <button 
            onClick={() => navigate('/artigos-aluno')} 
            className={`sidebar-btn ${location.pathname === '/artigos-aluno' ? 'active' : ''}`}
            type="button"
          >
            <span className="btn-icon">📚</span>
            {menuAberto && <span className="btn-text">Artigos</span>}
          </button>
          <button 
            onClick={() => navigate('/historico-quizzes')} 
            className={`sidebar-btn ${location.pathname === '/historico-quizzes' ? 'active' : ''}`}
            type="button"
          >
            <span className="btn-icon">📊</span>
            {menuAberto && <span className="btn-text">Resultados</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={fazerLogout} className="sidebar-btn btn-logout" type="button">
            <span className="btn-icon">🚪</span>
            {menuAberto && <span className="btn-text">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="main-content" style={{ 
        marginLeft: menuAberto ? '260px' : '80px', 
        width: '100%', 
        transition: 'margin-left 0.3s ease' 
      }}>
        {children}
      </div>
    </div>
  );
}
