import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HistoricoQuizzes.css';
import LayoutAluno from './LayoutAluno';

export default function HistoricoQuizzes() {
  const { getStudentCompletedAttempts } = useAuth();
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadCompletedQuizzes = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getStudentCompletedAttempts();
        
        console.log('📊 Resultado getStudentCompletedAttempts:', result);
        
        if (result.success) {
          setCompletedQuizzes(result.data || []);
        } else {
          setError(result.error || 'Erro ao carregar o histórico');
        }
      } catch (err) {
        console.error('❌ Erro inesperado:', err);
        setError('Erro ao carregar o histórico: ' + (err.message || 'Erro desconhecido'));
      }
      setLoading(false);
    };

    loadCompletedQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (loading) {
    return (
      <LayoutAluno>
        <div className="completed-quizzes-container">
          <div className="loading">Carregando histórico...</div>
        </div>
      </LayoutAluno>
    );
  }

  return (
    <LayoutAluno>
      <div className="completed-quizzes-container">
        <div className="completed-quizzes-box">
          <div className="quizzes-header">
            <h1>📊 Meus quizzes concluídos</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-back"
                onClick={() => navigate('/quizzes-aluno')}
              >
                ← Voltar para disponíveis
              </button>
            </div>
          </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {completedQuizzes.length === 0 ? (
          <div className="empty-state">
            <p>📭 Você ainda não completou nenhum quiz</p>
            <button 
              className="btn-start-first"
              onClick={() => navigate('/quizzes-aluno')}
            >
              ▶️ Ir para quizzes disponíveis
            </button>
          </div>
        ) : (
          <div className="completed-grid">
            {completedQuizzes.map((attempt) => {
              // Obter valores com validação
              let score = attempt.score ?? 0;
              let totalPoints = attempt.totalPoints ?? 100;
              const totalQuestions = attempt.totalQuestions ?? 3;
              
              console.log('Dados da tentativa:', { 
                score: attempt.score, 
                totalPoints: attempt.totalPoints, 
                totalQuestions: attempt.totalQuestions,
                correctAnswers: attempt.correctAnswers 
              });
              
              // Calcular porcentagem corretamente
              let percentage = 0;
              
              // Se temos correctAnswers, usar isso para calcular a porcentagem
              if (attempt.correctAnswers !== undefined && totalQuestions > 0) {
                percentage = Math.round((attempt.correctAnswers / totalQuestions) * 100);
              } 
              // Se score e totalPoints são válidos, usá-los
              else if (totalPoints > 0 && score <= totalPoints) {
                percentage = Math.round((score / totalPoints) * 100);
              }
              // Se score parece ser já um número de respostas corretas
              else if (totalQuestions > 0 && score <= totalQuestions) {
                percentage = Math.round((score / totalQuestions) * 100);
              }
              
              // Limitar entre 0-100
              percentage = Math.max(0, Math.min(100, percentage));
              
              console.log('Porcentagem calculada:', percentage);
              
              // Determinar a cor de acordo com a porcentagem
              // 0-59%: vermelho, 60-79%: amarelo, 80-100%: verde
              let scoreColor = '#28a745'; // Verde
              if (percentage < 50) {
                scoreColor = '#dc3545'; // Vermelho
              } else if (percentage < 80) {
                scoreColor = '#ffc107'; // Amarelo
              }

              // Usar correctAnswers e incorrectAnswers do backend se existirem
              const correctAnswers = attempt.correctAnswers ?? 
                Math.round((percentage / 100) * totalQuestions);
              const incorrectAnswers = attempt.incorrectAnswers ?? 
                (totalQuestions - correctAnswers);

              return (
                <div key={attempt.id} className="completed-quiz-card">
                  <div className="card-header">
                    <h3>{attempt.quizTitle || attempt.quiz?.title || 'Quiz'}</h3>
                    <span className="status-badge completed">✓ Concluído</span>
                  </div>
                  
                  <div className="card-body">
                    {/* Score Circle */}
                    <div className="score-circle" style={{ borderColor: scoreColor }}>
                      <div className="score-percentage" style={{ color: scoreColor }}>
                        {percentage}%
                      </div>
                    </div>

                    {/* Info Items */}
                    <div className="card-info">
                      <div className="info-row">
                        <span className="info-label">❓ Total de Questões:</span>
                        <span className="info-value">
                          {attempt.totalQuestions || attempt.quiz?.questions?.length || 0}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">✅ Respondidas:</span>
                        <span className="info-value correct">
                          {attempt.answeredCount || attempt.totalQuestions || attempt.quiz?.questions?.length || 0}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">⭐ Questões Corretas:</span>
                        <span className="info-value correct">
                          {correctAnswers}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">❌ Incorretas:</span>
                        <span className="info-value incorrect">
                          {incorrectAnswers}
                        </span>
                      </div>

                      {attempt.submittedAt && (
                        <div className="info-row">
                          <span className="info-label">📅 Data:</span>
                          <span className="info-value">
                            {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: scoreColor
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => navigate(`/resultado-quiz/${attempt.id}`)}
                    >
                      👁️ Ver Detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </LayoutAluno>
  );
}
