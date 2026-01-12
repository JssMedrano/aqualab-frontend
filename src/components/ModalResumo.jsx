import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ModalResumo.css';

export default function ModalResumo({ student, onClose }) {
  const { userType, getTeacherStudentResults, getStudentCompletedAttempts } = useAuth();
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [avgFromStats, setAvgFromStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCount, setErrorCount] = useState(0);

  const loadData = async () => {
    if (!student?.id) return;
    
    setErrorMsg(null);
    try {
      // Se for professor, usar endpoint dedicado
      if (userType === 'teacher' && typeof getTeacherStudentResults === 'function') {
        const result = await getTeacherStudentResults(student.id);
        if (result.success) {
          const attempts = result.data?.attempts || [];
          setCompletedQuizzes(attempts);
          const avg = result.data?.stats?.averageScore;
          if (typeof avg === 'number') setAvgFromStats(Math.round(avg));
          console.log('✅ Dados do estudante atualizados (professor):', attempts.length, 'tentativas');
          setErrorCount(0); // Reset error count on success
          return;
        } else {
          console.error('❌ Erro em getTeacherStudentResults:', result.error);
          setErrorMsg(result.error);
          setErrorCount(prev => prev + 1);
        }
      }

      // Fallback: tentar obter tentativas do aluno atual
      const res = await getStudentCompletedAttempts();
      if (res.success) {
        setCompletedQuizzes(res.data || []);
        console.log('✅ Dados do estudante atualizados (fallback):', res.data?.length, 'tentativas');
        setErrorCount(0); // Reset error count on success
      } else {
        setCompletedQuizzes([]);
        setErrorMsg(res.error);
        setErrorCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('❌ Erro carregando dados:', err);
      setErrorMsg(err.message || 'Erro desconhecido');
      setErrorCount(prev => prev + 1);
      setCompletedQuizzes([]);
    } finally {
      // End loading
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, userType]);

  // Auto-atualização a cada 10 segundos enquanto o modal está aberto
  // MAS para após 3 erros consecutivos
  useEffect(() => {
    if (errorCount >= 3) {
      console.warn('⚠️ Auto-atualização parada - 3 erros consecutivos. Clique em 🔄 para tentar novamente.');
      return;
    }
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-atualização do modal (cada 10s)');
      loadData();
    }, 10000); // 10 segundos
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id, errorCount]);

  if (!student) return null;

  const averageScore = avgFromStats !== null
    ? avgFromStats
    : (completedQuizzes.length > 0
        ? Math.round(
            completedQuizzes.reduce((sum, q) => {
              const pct = typeof q.percentage === 'number'
                ? q.percentage
                : ((q.totalPoints || 100) > 0 ? Math.round(((q.score || 0) / (q.totalPoints || 100)) * 100) : 0);
              return sum + pct;
            }, 0) / completedQuizzes.length
          )
        : 0);

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-student-info">
            <div className="modal-avatar" style={{
              backgroundColor: '#667eea'
            }}>
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div className="modal-info-text">
              <h2>{student.name}</h2>
              <p>Matrícula: {student.enrollmentNumber}</p>
            </div>
          </div>
          <div className="modal-header-actions">
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{
              backgroundColor: errorCount >= 3 ? '#f8d7da' : '#fff3cd',
              border: `1px solid ${errorCount >= 3 ? '#f5c6cb' : '#ffc107'}`,
              color: errorCount >= 3 ? '#721c24' : '#856404',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              {errorCount >= 3 ? (
                <>
                  <strong>🔴 Backend não responde corretamente</strong>
                  <br />
                  {errorMsg}
                  <br />
                  <small style={{ display: 'block', marginTop: '8px', opacity: 0.8 }}>
                    Auto-refresh parado. Clique 🔄 acima para tentar novamente.
                  </small>
                </>
              ) : (
                <>⚠️ {errorMsg}</>
              )}
            </div>
          )}
          
          <div className="modal-stats">
            <div className="stat-box">
              <div className="stat-label">Ano</div>
              <div className="stat-data">{typeof student.year === 'object' ? student.year.year : student.year}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Quizzes Concluídos</div>
              <div className="stat-data">{completedQuizzes.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Média</div>
              <div className="stat-data" style={{ color: getScoreColor(averageScore) }}>
                {averageScore}%
              </div>
            </div>
          </div>

          {completedQuizzes.length > 0 ? (
            <div className="modal-quizzes">
              <h3>Quizzes Concluídos</h3>
              <div className="quiz-items">
                {completedQuizzes.map((quiz, idx) => {
                  // Obter valores originais
                  let score = quiz.score ?? 0;
                  let totalPoints = quiz.totalPoints ?? 100;
                  
                  // Detectar se score já é uma porcentagem (valor > totalPoints indica erro nos dados)
                  // Se score parece ser uma porcentagem (>100 ou maior que totalPoints), ajustar
                  let percentage;
                  if (typeof quiz.percentage === 'number') {
                    percentage = Math.max(0, Math.min(100, Math.round(quiz.percentage)));
                  } else if (totalPoints > 0) {
                    percentage = Math.round((score / totalPoints) * 100);
                  } else {
                    percentage = 0;
                  }
                  
                  // Limitar porcentagem entre 0 e 100
                  percentage = Math.max(0, Math.min(100, percentage));
                  
                  console.log('Quiz:', quiz.quizTitle, 'Pontuação original:', quiz.score, 'Total:', quiz.totalPoints, 'Porcentagem calculada:', percentage);
                  
                  return (
                    <div key={idx} className="quiz-item" style={{ 
                      borderLeftColor: getScoreColor(percentage) 
                    }}>
                      <div className="quiz-item-header">
                        <span className="quiz-name">{quiz.quizTitle || 'Quiz'}</span>
                        <span className="quiz-score" style={{ 
                          color: getScoreColor(percentage),
                          backgroundColor: 'rgba(25, 118, 210, 0.1)'
                        }}>
                          {Math.round(percentage)}/100
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getScoreColor(percentage)
                          }}
                        />
                      </div>
                      <div className="quiz-info">
                        <span className="percentage" style={{ 
                          color: getScoreColor(percentage),
                          fontWeight: 700
                        }}>
                          {percentage}%
                        </span>
                        <span className="date">{new Date(quiz.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="modal-empty">
              <p>📭 O estudante não completou nenhum quizz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
