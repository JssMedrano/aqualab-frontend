import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './ResponderQuiz.css';

export default function ResponderQuiz() {
  const { quizId, attemptId } = useParams();
  const { submitQuizAttempt, token } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      console.log('📚 Carregando quiz para estudante:', quizId);
      console.log('🔑 Token disponível:', !!token);
      console.log('🆔 AttemptId:', attemptId);
      
      let quizData = null;
      
      // Opção 1: Tentar GET /quizzes/{quizId} (a mais segura)
      try {
        console.log('🔄 Tentando GET /api/quizzes/' + quizId);
        const getResponse = await axios.get(`/api/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ GET /quizzes/{id} respondeu:', getResponse.data);
        console.log('📊 Estrutura: ', Object.keys(getResponse.data));
        
        // Suportar múltiplos formatos de resposta
        if (getResponse.data?.data) {
          quizData = getResponse.data.data;
        } else {
          quizData = getResponse.data;
        }
        
        console.log('📖 quizData depois de processar GET:', quizData);
        console.log('❓ Tem questions?:', !!quizData?.questions);
        if (quizData?.questions) {
          console.log('✅ Perguntas encontradas:', quizData.questions.length);
        }
      } catch (getError) {
        console.warn('⚠️ GET /quizzes/{id} falhou:', getError.response?.status, getError.message);
        console.warn('⚠️ Resposta de erro:', getError.response?.data);
        
        // Se falhar GET, tentar POST /start como fallback
        try {
          console.log('🔄 Fallback: Tentando POST /api/quizzes/' + quizId + '/start');
          const startResponse = await axios.post(`/api/quizzes/${quizId}/start`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ POST /start respondeu:', startResponse.data);
          
          if (startResponse.data?.data) {
            quizData = startResponse.data.data;
          } else {
            quizData = startResponse.data;
          }
          
          console.log('📖 quizData depois de processar POST /start:', quizData);
        } catch (startErr) {
          console.error('❌ POST /start também falhou:', startErr.response?.status, startErr.message);
          throw startErr;  // Propagar o erro
        }
      }
      
      // Validar que temos perguntas
      if (!quizData?.questions || !Array.isArray(quizData.questions)) {
        console.error('❌ Não há perguntas na resposta');
        console.error('📦 quizData recebido:', quizData);
        setError('O quiz não contém perguntas. Resposta: ' + JSON.stringify(quizData).substring(0, 100));
        setLoading(false);
        return;
      }
      
      console.log('✅ Quiz carregado com ' + quizData.questions.length + ' perguntas');
      setQuiz(quizData);
      
      // Inicializar respostas vazias
      const emptyAnswers = {};
      quizData.questions.forEach((_, idx) => {
        emptyAnswers[idx] = null;
      });
      setAnswers(emptyAnswers);
    } catch (err) {
      console.error('❌ Erro ao carregar quiz:', err.response?.status, err.response?.data, err.message);
      
      // Se falhar, mostrar erro detalhado
      let errorMsg = err.response?.data?.message || err.message || 'Erro ao carregar quiz';
      if (err.response?.status === 401) {
        errorMsg = 'Token inválido ou expirado. Por favor, faça login novamente.';
      } else if (err.response?.status === 403) {
        errorMsg = 'Você não tem permissão para ver este quiz.';
      } else if (err.response?.status === 404) {
        errorMsg = 'Quiz não encontrado.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Erro no servidor. Tente novamente mais tarde.';
      }
      
      console.error('📋 Mensagem de erro final:', errorMsg);
      setError(errorMsg);
    }
    setLoading(false);
  };

  const handleSelectAnswer = (questionIndex, optionIndex, optionId) => {
    // Guardar tanto o índice quanto o ID da opção
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        index: optionIndex,
        id: optionId
      }
    }));
  };

  const handleSubmit = async () => {
    // Validar que todas as perguntas tenham resposta
    const allAnswered = quiz?.questions?.every((_, idx) => answers[idx] !== null && answers[idx] !== undefined);
    
    if (!allAnswered) {
      alert('⚠️ Você deve responder todas as perguntas antes de enviar');
      return;
    }

    // Prevenir envio duplo
    if (submitting) {
      console.log('⚠️ Já está enviando o quiz, ignorando...');
      return;
    }

    setSubmitting(true);
    
    try {
      // Preparar formato de respostas para o backend
      // O backend espera um array com questionId e optionId
      const formattedAnswers = quiz?.questions?.map((q, idx) => {
        const answer = answers[idx];
        const optionId = answer?.id || answer;  // Se for objeto, usa o id; se não, usa o valor direto
        return {
          questionId: q.id,  // ID da pergunta
          optionId: optionId  // ID da opção selecionada
        };
      }) || [];

      console.log('📤 Enviando respostas formatadas:', formattedAnswers);
      console.log('🆔 ID da tentativa:', attemptId);
      console.log('� submitQuizAttempt tipo:', typeof submitQuizAttempt);
      console.log('🔍 submitQuizAttempt definida:', !!submitQuizAttempt);
      console.log('📋 Payload completo:', { answers: formattedAnswers });

      // Log adicional para verificar IDs
      console.log('🔍 Verificação de IDs:');
      quiz?.questions?.forEach((q, idx) => {
        const answer = answers[idx];
        console.log(`  Pergunta ${idx + 1}: ID=${q.id}, OptionID=${answer?.id || answer}`);
      });

      if (!submitQuizAttempt) {
        throw new Error('submitQuizAttempt não está definida no contexto');
      }

      if (typeof submitQuizAttempt !== 'function') {
        throw new Error(`submitQuizAttempt não é uma função: ${typeof submitQuizAttempt}`);
      }

      console.log('🚀 Chamando submitQuizAttempt...');
      const result = await submitQuizAttempt(attemptId, formattedAnswers, quiz);
      
      console.log('✅ Resultado de submitQuizAttempt:', result);
      console.log('✅ result.data:', result?.data);
      console.log('✅ result.success:', result?.success);
      
      if (result?.success) {
        // Extrair dados do resultado
        const data = result.data;
        console.log('📊 Dados completos recebidos:', data);
        
        // Tentar obter score e totalPoints de várias formas possíveis
        const score = data?.score ?? data?.data?.score ?? 0;
        const totalPoints = data?.totalPoints ?? data?.data?.totalPoints ?? 100;
        const totalQuestions = quiz?.questions?.length || 0;
        const status = data?.status ?? data?.data?.status ?? 'completed';
        
        console.log('📊 Score extraído:', score);
        console.log('📊 TotalPoints extraído:', totalPoints);
        console.log('📊 TotalQuestions:', totalQuestions);
        
        const percentage = totalPoints > 0 
          ? Math.round((score / totalPoints) * 100)
          : 0;
        
        const resultMessage = `✅ Quiz Concluído!

📊 Seu Resultado:
━━━━━━━━━━━━━━━━━━
• Pontuação: ${score}/${totalPoints} pontos
• Porcentagem: ${percentage}%
• Questões: ${totalQuestions}
• Status: ${status}

✅ O resultado foi salvo no banco de dados.
Você será redirecionado para o seu dashboard em 3 segundos...`;
        
        alert(resultMessage);
        
        console.log('🎉 Quiz completado com sucesso e salvo no banco, redirecionando...');
        
        // Redirecionar para completados após 3 segundos
        setTimeout(() => {
          navigate('/historico-quizzes', { 
            state: { 
              message: 'Quiz completado com sucesso e salvo no banco',
              score,
              totalPoints,
              percentage
            }
          });
        }, 3000);
      } else {
        console.error('❌ Erro em submitQuizAttempt:', result?.error);
        alert('❌ Erro ao enviar respostas:\n\n' + (result?.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('❌ Erro inesperado em handleSubmit:', err);
      console.error('❌ Stack do erro:', err?.stack);
      alert('❌ Erro inesperado:\n\n' + (err?.message || 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="take-quiz-container">
        <div className="loading">Carregando quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="take-quiz-container">
        <div className="error-message">
          <h2>❌ {error || 'Quiz não encontrado'}</h2>
          {error && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#fff3cd', 
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: '#333'
            }}>
              <p><strong>Detalhes do erro:</strong></p>
              <p style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {error}
              </p>
              <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                💡 Abra o console do navegador (F12) para ver mais detalhes de depuração.
              </p>
            </div>
          )}
          <br />
          <button className="btn-nav" onClick={() => navigate('/quizzes-aluno')}>
            ← Voltar para quizzes
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions?.[currentQuestion];
  const totalQuestions = quiz.questions?.length || 0;
  const answeredQuestions = Object.values(answers).filter(a => a !== null && a !== undefined).length;

  return (
    <div className="take-quiz-container">
      <div className="take-quiz-box">
        <div className="quiz-header">
          <h1>{quiz.title}</h1>
          <p className="description">{quiz.description}</p>
        </div>

        <div className="progress-section">
          <div className="progress-info">
            <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
            <span className="answers-count">Respondidas: {answeredQuestions}/{totalQuestions}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {question && (
          <div className="question-section">
            <div className="question-text">
              <span className="question-number">Pergunta {currentQuestion + 1}</span>
              <h2>{question.statement || question.question || 'Sem pergunta'}</h2>
            </div>

            <div className="options-section">
              {question.options?.map((option, optionIdx) => {
                // As opções podem ser strings simples ou objetos {text, isCorrect, id}
                const optionText = typeof option === 'string' ? option : (option?.text || '');
                const optionId = typeof option === 'string' ? optionIdx : (option?.id || optionIdx);
                const isSelected = answers[currentQuestion]?.id === optionId || answers[currentQuestion]?.index === optionIdx;
                
                return (
                  <div
                    key={optionIdx}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectAnswer(currentQuestion, optionIdx, optionId)}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(currentQuestion, optionIdx, optionId)}
                    />
                    <label>{optionText}</label>
                  </div>
                );
              })}
            </div>

            {question.points && (
              <div className="points-info">
                ⭐ {question.points} pontos
              </div>
            )}
          </div>
        )}

        <div className="navigation-section">
          <button
            className="btn-nav"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            ← Anterior
          </button>

          <div className="question-dots">
            {quiz.questions?.map((_, idx) => (
              <div
                key={idx}
                className={`dot ${idx === currentQuestion ? 'active' : ''} ${
                  answers[idx] !== null && answers[idx] !== undefined ? 'answered' : ''
                }`}
                onClick={() => setCurrentQuestion(idx)}
                title={`Pergunta ${idx + 1}`}
              />
            ))}
          </div>

          {currentQuestion < totalQuestions - 1 ? (
            <button
              className="btn-nav"
              onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
            >
              Próxima →
            </button>
          ) : (
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '⏳ Enviando...' : '✅ Enviar Respostas'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
