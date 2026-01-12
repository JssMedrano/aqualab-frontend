import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './QuizzesAluno.css';
import LayoutAluno from './LayoutAluno';

export default function QuizzesAluno() {
  const { getQuizzes, startQuizAttempt, user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [iniciando, setIniciando] = useState(null);
  const navigate = useNavigate();

  const carregarQuizzes = async () => {
    setCarregando(true);
    setErro('');
    try {
      const resultado = await getQuizzes();
      if (resultado.success) {
        let lista = resultado.data || [];
        
        let anoEstudante = null;
        if (user?.year) {
          anoEstudante = typeof user.year === 'object' 
            ? user.year.year 
            : user.year;
          anoEstudante = parseInt(String(anoEstudante), 10);
        }
        
        const idEstudante = user?.id || 'unknown';
        const chaveQuizzesCompletados = `completedQuizIds_${idEstudante}`;
        const idsQuizzesCompletados = JSON.parse(localStorage.getItem(chaveQuizzesCompletados) || '[]');
        
        if (anoEstudante && Number.isFinite(anoEstudante)) {
          lista = lista.filter((q) => {
            if (idsQuizzesCompletados.includes(q.id)) {
              return false;
            }
            
            let anoQuiz = null;
            
            if (q.year) {
              anoQuiz = typeof q.year === 'object' 
                ? q.year.year 
                : q.year;
              anoQuiz = parseInt(String(anoQuiz), 10);
            }
            
            if (anoQuiz) {
              return anoQuiz === anoEstudante;
            }
            
            return true;
          });
        } else {
          lista = lista.filter((q) => !idsQuizzesCompletados.includes(q.id));
        }
        
        setQuizzes(lista);
      } else {
        setErro(resultado.error || 'Erro ao carregar quizzes');
      }
    } catch (err) {
      setErro('Erro de conexão: ' + err.message);
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregarQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iniciarQuiz = async (quizId) => {
    setIniciando(quizId);
    const resultado = await startQuizAttempt(quizId);
    
    if (resultado.success) {
      let attemptId = null;
      
      if (resultado.data?.data?.id) {
        attemptId = resultado.data.data.id;
      } else if (resultado.data?.id) {
        attemptId = resultado.data.id;
      } else if (resultado.data?.attemptId) {
        attemptId = resultado.data.attemptId;
      }
      
      if (attemptId) {
        navigate(`/responder-quiz/${quizId}/${attemptId}`);
      } else {
        alert('❌ Erro: Não foi recebido o ID da tentativa.');
      }
    } else {
      alert('❌ Erro: ' + resultado.error);
    }
    setIniciando(null);
  };

  if (carregando) {
    return (
      <LayoutAluno>
        <div className="student-quizzes-container">
          <div className="loading">Carregando quizzes...</div>
        </div>
      </LayoutAluno>
    );
  }

  return (
    <LayoutAluno>
      <div className="student-quizzes-container">
        <div className="student-quizzes-box">
          <div className="quizzes-header">
            <h1>📚 Quizzes disponíveis</h1>
            <div className="header-buttons">
              <button 
                className="btn-back"
                onClick={() => navigate(-1)}
              >
                ← Voltar
              </button>
            </div>
          </div>

        {erro && (
          <div className="error-message">
            ❌ {erro}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <p>📭 Não há quizzes disponíveis no momento</p>
            {user?.year && (
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                📌 Seu ano: {typeof user.year === 'object' ? user.year.year : user.year}
              </p>
            )}
            {!user?.year && (
              <p style={{ fontSize: '0.9rem', color: '#ff6b6b', marginTop: '1rem' }}>
                ⚠️ Não tem ano conectado a você. Entre em contato com Professor.
              </p>
            )}
            {(() => {
              const idEstudante = user?.id || 'unknown';
              const chaveQuizzesCompletados = `completedQuizIds_${idEstudante}`;
              const contagemCompletados = JSON.parse(localStorage.getItem(chaveQuizzesCompletados) || '[]').length;
              if (contagemCompletados > 0) {
                return (
                  <p style={{ fontSize: '0.9rem', color: '#28a745', marginTop: '1rem' }}>
                    ✅ Você concluiu {contagemCompletados} quiz{contagemCompletados > 1 ? 'zes' : ''}. 
                    <br />
                    <button 
                      onClick={() => navigate('/historico-quizzes')}
                      style={{ 
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Ver meus resultados
                    </button>
                  </p>
                );
              }
              return null;
            })()}
            <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem', fontStyle: 'italic' }}>
              💡 Se você acabou de se cadastrar, tente atualizar a página.
            </p>
          </div>
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                </div>
                <div className="quiz-card-body">
                  <p className="description">{quiz.description}</p>
                  <div className="quiz-info">
                    <span className="info-item">
                      ❓ {quiz.questions?.length || 0} perguntas
                    </span>
                    <span className="info-item">
                      ⭐ {quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0} pontos
                    </span>
                  </div>
                </div>
                <div className="quiz-card-footer">
                  <button
                    className="btn-start"
                    onClick={() => iniciarQuiz(quiz.id)}
                    disabled={iniciando === quiz.id}
                  >
                    {iniciando === quiz.id ? '⏳ Iniciando...' : '▶️ Iniciar Quiz'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </LayoutAluno>
  );
}
