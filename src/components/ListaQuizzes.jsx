import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ListaQuizzes.css';

export default function ListaQuizzes() {
  const { getQuizzes, deleteQuiz, userType, token } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getQuizzes();
      if (result.success) {
        setQuizzes(result.data || []);
      } else {
        setError(result.error || 'Erro ao carregar quizzes');
        console.error('Erro carregando quizzes:', result);
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
      console.error('Erro carregando quizzes:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este quiz?')) {
      return;
    }

    const result = await deleteQuiz(id);
    if (result.success) {
      setQuizzes(quizzes.filter(q => q.id !== id));
      alert('Quiz excluído com sucesso');
    } else {
      alert('Erro ao excluir: ' + result.error);
    }
  };

  const canManage = token && userType === 'teacher';

  if (loading) {
    return (
      <div className="quiz-list-container">
        <div className="loading">Carregando quizzes...</div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-box">
        <div className="list-header">
          <h1>📚 Lista de Quizzes</h1>
          <div className="header-actions">
            {canManage && (
              <button 
                className="btn-create"
                onClick={() => navigate('/criar-quiz')}
              >
                + Criar novo Quiz
              </button>
            )}
            <button 
              className="btn-back"
              onClick={() => navigate(-1)}
            >
              ← Voltar
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
            <br />
            <small>
              {error.includes('Endpoint') && (
                <>
                  <br /><br />
                  <strong>Solução:</strong> Implemente o endpoint GET /api/quizzes no seu backend (porta 3333).
                </>
              )}
              {error.includes('No se pudo conectar') && (
                <>
                  <br /><br />
                  <strong>Verifique:</strong> O servidor está rodando na porta 3333?
                </>
              )}
            </small>
            <br /><br />
            <button 
              className="btn-retry"
              onClick={loadQuizzes}
            >
              🔄 Recarregar
            </button>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="no-quizzes">
            <p>📭 Não há quizzes disponíveis!</p>
            {canManage && (
              <button 
                className="btn-create-first"
                onClick={() => navigate('/criar-quiz')}
              >
                Criar o primeiro quiz
              </button>
            )}
          </div>
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                  <span className="quiz-badge">
                    3 Perguntas
                  </span>
                </div>
                
                {/* Descrição removida por solicitação */}

                <div className="quiz-stats">
                  <div className="stat">
                    <span className="stat-label">Total Pontos:</span>
                    <span className="stat-value">
                      {quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0}
                    </span>
                  </div>
                  {quiz.createdAt && (
                    <div className="stat">
                      <span className="stat-label">Criado:</span>
                      <span className="stat-value">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="quiz-actions">
                  <button 
                    className="btn-view"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    👁️ Ver
                  </button>
                  {canManage && (
                    <>
                      <button 
                        className="btn-edit"
                        onClick={() => navigate(`/editar-quiz/${quiz.id}`)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        🗑️ Apagar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
