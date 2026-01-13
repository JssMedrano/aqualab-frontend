import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LayoutAluno from './LayoutAluno';
import './PainelAluno.css';
import bgImage from '../assets/Fondo01.png';

export default function PainelAluno() {
  const { user } = useAuth();
  const [mostrarQuebraCabeca, setMostrarQuebraCabeca] = useState(false);
  const navigate = useNavigate();

  const areasConteudo = [
    { id: 'quizzes', title: 'Quizzes', color: '#4a90e2', icon: '📖' },
    { id: 'videos', title: 'Vídeos', color: '#6bc1ff', icon: '🎬' },
    { id: 'articles', title: 'Artigos', color: '#7bdcb5', icon: '📚' },
    { id: 'results', title: 'Resultados', color: '#f5a623', icon: '📊' }
  ];

  const iniciarConteudo = (areaId) => {
    const rotas = {
      quizzes: '/quizzes-aluno',
      videos: '/videos-aluno',
      articles: '/artigos-aluno',
      results: '/historico-quizzes'
    };
    navigate(rotas[areaId] || '/quizzes-aluno');
  };

  const estiloFundo = {
    // Dark overlay consistent with Home initial style
    backgroundImage: `linear-gradient(135deg, rgba(3, 3, 3, 0) 0%, rgba(8, 8, 8, 0.55) 100%), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%'
  };

  return (
    <LayoutAluno>
      <div className="dashboard-content">
        <div className="dashboard-main" style={estiloFundo}>
          <div className="dashboard-greeting">
            <h1>Bem-vindo, {user?.name}!</h1>
            <p>Mergulhe com a Barão de Ramalho no AquaLab! Conteúdos preparados 
             <br></br> especialmente para transformar água em sabedoria e alegria!</p>
          </div>

          {!mostrarQuebraCabeca && (
            <div className="welcome-section">
              <button 
                className="start-learning-btn"
                onClick={() => setMostrarQuebraCabeca(true)}
              >
                Começar →
              </button>
            </div>
          )}

          {mostrarQuebraCabeca && (
            <div className="quebra-cabeca-container">
              <div className="quebra-cabeca-tabuleiro">
                {areasConteudo.map((area, idx) => {
                  const classesPeca = ['peca-esq-sup', 'peca-dir-sup', 'peca-esq-inf', 'peca-dir-inf'];
                  return (
                    <button
                      key={area.id}
                      className={`quebra-cabeca-peca ${classesPeca[idx]}`}
                      style={{ backgroundColor: area.color }}
                      onClick={() => iniciarConteudo(area.id)}
                      type="button"
                    >
                      <div className="quebra-cabeca-conteudo">
                        <span className="quebra-cabeca-icone">{area.icon}</span>
                        <span className="quebra-cabeca-titulo">{area.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutAluno>
  );
}
