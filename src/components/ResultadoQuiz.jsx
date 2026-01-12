import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ResultadoQuiz.css';

export default function ResultadoQuiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuizResult = async () => {
      setLoading(true);
      setError('');

      try {
        // Obter resultados do localStorage
        const studentId = user?.id || 'unknown';
        const completedQuizzesKey = `completedQuizzes_${studentId}`;
        const completedQuizzes = JSON.parse(localStorage.getItem(completedQuizzesKey) || '[]');
        
        console.log('🔍 Buscando tentativa:', attemptId);
        console.log('📊 Quizzes completados:', completedQuizzes);
        
        // Buscar a tentativa específica
        const attempt = completedQuizzes.find(q => q.id === attemptId);
        
        if (!attempt) {
          setError('Não foi encontrado o resultado do quiz');
          setLoading(false);
          return;
        }

        console.log('✅ Attempt encontrado:', attempt);
        console.log('📋 Results:', attempt.results);
        
        setQuizResult(attempt);
      } catch (err) {
        console.error('❌ Error cargando resultados:', err);
        setError('Erro ao carregar os detalhes: ' + err.message);
      }

      setLoading(false);
    };

    loadQuizResult();
  }, [attemptId, user]);

  if (loading) {
    return (
      <div className="quiz-results-container">
        <div className="loading">Carregando resultados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-results-container">
        <div className="quiz-results-box">
          <div className="error-message">❌ {error}</div>
          <button className="btn-back" onClick={() => navigate('/historico-quizzes')}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="quiz-results-container">
        <div className="quiz-results-box">
          <p>Não foram encontrados resultados</p>
          <button className="btn-back" onClick={() => navigate('/historico-quizzes')}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const percentage = quizResult.totalPoints > 0 
    ? Math.round((quizResult.score / quizResult.totalPoints) * 100)
    : 0;

  let scoreColor = '#28a745';
  if (percentage <= 33) {
    scoreColor = '#dc3545';
  } else if (percentage <= 66) {
    scoreColor = '#ffc107';
  }

  return (
    <div className="quiz-results-container">
      <div className="quiz-results-box">
        <div className="results-header">
          <h1>📊 Resultados do Quiz</h1>
          <div className="header-actions">
            <button className="btn-back" onClick={() => navigate('/painel-aluno')}>
              🏠 Início
            </button>
            <button className="btn-back" onClick={() => navigate('/historico-quizzes')}>
              ← Voltar
            </button>
          </div>
        </div>

        {/* Resumen del Quiz */}
        <div className="results-summary">
          <h2>{quizResult.quizTitle}</h2>
          
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-label">Pontuação</div>
                <div className="stat-value" style={{ color: scoreColor }}>
                  {quizResult.score}/{quizResult.totalPoints}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Porcentagem</div>
                <div className="stat-value" style={{ color: scoreColor }}>
                  {percentage}%
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Corretas</div>
                <div className="stat-value correct">
                  {quizResult.correctAnswers || 0}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-label">Incorretas</div>
                <div className="stat-value incorrect">
                  {quizResult.incorrectAnswers || 0}
                </div>
              </div>
            </div>
          </div>

          {quizResult.submittedAt && (
            <div className="submission-date">
              📅 Completado em: {new Date(quizResult.submittedAt).toLocaleDateString()} às {new Date(quizResult.submittedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Detalhe das Respostas */}
        <div className="results-details">
          <h3>📝 Detalhe das Respostas</h3>
          
          {quizResult.results && quizResult.results.length > 0 ? (
            <div className="questions-list">
              {quizResult.results.map((result, idx) => (
                <div 
                  key={idx} 
                  className={`question-result ${result.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-header">
                    <span className="question-number">Pergunta {idx + 1}</span>
                    <span className={`result-badge ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.isCorrect ? '✓ Correta' : '✗ Incorreta'}
                    </span>
                  </div>

                  <div className="question-text">
                    {result.questionText || result.question?.text || 'Pergunta'}
                  </div>

                  <div className="answer-info">
                    <div className="answer-row">
                      <span className="answer-label">Sua resposta:</span>
                      <span className={`answer-value ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                        {result.selectedAnswer || result.selectedOption?.text || result.studentAnswer || 'Não disponível'}
                      </span>
                    </div>

                    {!result.isCorrect && (
                      <div className="answer-row">
                        <span className="answer-label">Resposta correta:</span>
                        <span className="answer-value correct">
                          {result.correctAnswer || result.correctOption?.text || result.correctAnswerText || 'Não disponível'}
                        </span>
                      </div>
                    )}
                  </div>

                  {result.points !== undefined && (
                    <div className="points-earned">
                      Pontos obtidos: {result.isCorrect ? result.points : 0}/{result.points}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-details">
              <p>ℹ️ Não há detalhes de respostas disponíveis</p>
              
              <p>Este questionário foi concluído, mas os detalhes de cada resposta não foram salvos.</p>
            </div>
          )}
        </div>

        {/* Botão para tentar novamente */}
        <div className="results-actions">
          <button 
            className="btn-retry" 
            onClick={() => navigate('/quizzes-aluno')}
          >
            🔄 Ver outros Quizzes
          </button>
          <button 
            className="btn-completed" 
            onClick={() => navigate('/historico-quizzes')}
          >
            📊 Ver todos meus Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
