import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './QuizComum.css';
import './EditarQuiz.css';

export default function EditarQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userType, token, getQuizById, updateQuiz, deleteQuiz } = useAuth();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit = token && userType === 'teacher';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      if (!canEdit) {
        setError('Apenas professores podem editar quizzes.');
        setLoading(false);
        return;
      }

      const result = await getQuizById(id);
      if (result.success) {
        const q = result.data;
        
        console.log('📋 Quiz completo recebido:', JSON.stringify(q, null, 2));
        
        // Salvar yearId original
        const qYearId = q.yearId || q.year?.id || '';
        console.log('🔍 Campos disponíveis em quiz:', Object.keys(q));
        console.log('  - yearId:', q.yearId);
        console.log('  - year:', q.year);
        console.log('  - year?.id:', q.year?.id);
        console.log('  - Valor final qYearId:', qYearId);
        
        // Mapear perguntas do formato do backend
        const mappedQuestions = (q.questions || []).map((qq, qIdx) => {
          console.log(`📝 Pergunta ${qIdx}:`, qq);
          console.log(`  - Opções:`, qq.options);
          console.log(`  - Tipo primeira opção:`, typeof qq.options?.[0]);
          
          // O backend pode retornar "statement" ou "question"
          const questionText = qq.statement || qq.question || '';
          
          // Mapear opções: podem ser array de strings ou objetos com isCorrect
          let options = [];
          let correctAnswer = 0;
          
          if (Array.isArray(qq.options)) {
            if (qq.options.length > 0 && typeof qq.options[0] === 'object') {
              // Formato: {text, isCorrect}
              console.log(`  ✅ Detectado formato objeto com isCorrect`);
              options = qq.options.map(opt => opt.text || opt);
              const correctIdx = qq.options.findIndex(opt => opt.isCorrect === true);
              correctAnswer = correctIdx >= 0 ? correctIdx : 0;
              console.log(`  - Opções mapeadas para strings:`, options);
              console.log(`  - Índice correto encontrado:`, correctAnswer);
            } else {
              // Formato: array simples de strings
              console.log(`  ⚠️ Detectado formato array simples (sem isCorrect)`);
              options = qq.options;
              // correctAnswer pode vir em qq.correctAnswer ou como array
              if (Array.isArray(qq.correctAnswer)) {
                correctAnswer = qq.correctAnswer[0] ?? 0;
              } else {
                correctAnswer = typeof qq.correctAnswer === 'number' ? qq.correctAnswer : 0;
              }
              console.log(`  - Usando correctAnswer do campo:`, correctAnswer);
            }
          }
          
          const mappedQuestion = {
            question: questionText,
            options: options.length > 0 ? options : ['', '', '', ''],
            correctAnswer: correctAnswer,
            points: typeof qq.points === 'number' ? qq.points : 10,
          };
          
          console.log(`  ➡️ Pergunta mapeada:`, mappedQuestion);
          
          return mappedQuestion;
        });
        
        console.log('🎯 Todas as perguntas mapeadas:', mappedQuestions);
        
        setQuizData({
          title: q.title || '',
          description: q.description || '',
          year: q.year?.year ?? q.year ?? user?.year ?? 1,
          questions: mappedQuestions.length > 0 ? mappedQuestions : [
            { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }
          ],
        });
        
        console.log('✅ Estado quizData atualizado');
      } else {
        setError(result.error || 'Não foi possível carregar o quiz');
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData((prev) => {
      const next = { ...prev };
      next.questions = [...prev.questions];
      next.questions[index] = { ...next.questions[index], [field]: value };
      return next;
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData((prev) => {
      const next = { ...prev };
      next.questions = [...prev.questions];
      const q = { ...next.questions[questionIndex] };
      const opts = [...q.options];
      opts[optionIndex] = value;
      q.options = opts;
      next.questions[questionIndex] = q;
      return next;
    });
  };

  const addQuestion = () => {
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setQuizData((prev) => {
      if (prev.questions.length <= 1) return prev;
      return { ...prev, questions: prev.questions.filter((_, i) => i !== index) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizData) return;

    setError('');

    if (!quizData.title.trim()) {
      setError('O título é obrigatório');
      return;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.question.trim()) {
        setError(`A pergunta ${i + 1} está vazia`);
        return;
      }
      if (q.options.some((opt) => !String(opt || '').trim())) {
        setError(`A pergunta ${i + 1} tem opções vazias`);
        return;
      }
    }

    setSaving(true);

    // Converter para o formato esperado pelo backend EXATO
    const payload = {
      title: quizData.title,
      description: quizData.description,
      // Não enviar yearId - mantém-se o original no backend
      questions: quizData.questions.map((q) => {
        const correctIdx = typeof q.correctAnswer === 'string' 
          ? parseInt(q.correctAnswer, 10) 
          : q.correctAnswer;
        
        return {
          quizId: id, // Incluir o ID do quiz que está sendo editado
          statement: q.question,
          options: q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === correctIdx
          }))
        };
      }),
    };

    console.log('📤 Payload para PUT /quizzes:', JSON.stringify(payload, null, 2));

    const result = await updateQuiz(id, payload);
    if (result.success) {
      alert('✅ Quiz atualizado');
      navigate('/quizzes-professor');
    } else {
      setError(result.error || 'Erro ao atualizar quiz');
      alert('❌ ' + (result.error || 'Não foi possível atualizar'));
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.')) {
      return;
    }

    setSaving(true);
    const result = await deleteQuiz(id);
    if (result.success) {
      alert('✅ Quiz excluído');
      navigate('/quizzes-professor');
    } else {
      setError(result.error || 'Erro ao excluir quiz');
      alert('❌ ' + (result.error || 'Não foi possível excluir'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-quiz-container">
        <div className="edit-quiz-box">
          <div className="loading">Carregando quiz...</div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="edit-quiz-container">
        <div className="edit-quiz-box">
          <div className="error-message">❌ {error || 'Quiz não encontrado'}</div>
          <button className="btn-back" onClick={() => navigate('/quizzes-professor')}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  console.log('🎨 RENDERIZANDO COMPONENTE COM quizData:', JSON.stringify(quizData.questions.map(q => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer
  })), null, 2));

  return (
    <div className="edit-quiz-container">
      <div className="edit-quiz-box">
        <div className="header">
          <button className="btn-back" onClick={() => navigate('/quizzes-professor')}>
            ← Voltar
          </button>
          <div>
            <h1>✏️ Editar Quiz</h1>
            <p className="subtitle">Ano fixo: {user?.year ?? quizData.year}</p>
          </div>
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input name="title" value={quizData.title} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea name="description" value={quizData.description} onChange={handleInputChange} rows={3} />
          </div>

          <div className="form-group">
            <label>Ano *</label>
            <input value={user?.year ?? quizData.year} disabled />
            <small>O backend permite apenas o seu ano atribuído.</small>
          </div>

          <div className="questions-header">
            <h2>Questões ({quizData.questions.length})</h2>
            <button type="button" className="btn-add" onClick={addQuestion}>
              + Adicionar
            </button>
          </div>

          {quizData.questions.map((q, idx) => (
            <div key={idx} className="question-card">
              <div className="question-header">
                <h3>Questão {idx + 1}</h3>
                {quizData.questions.length > 1 && (
                  <button type="button" className="remove-question-btn" onClick={() => removeQuestion(idx)}>
                     🗑️ Remover
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Enunciado *</label>
                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <div className="options-grid">
                {q.options.map((opt, optIdx) => {
                  return (
                    <div key={optIdx} className="option-group">
                      <label>
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctAnswer === optIdx}
                          onChange={() => handleQuestionChange(idx, 'correctAnswer', optIdx)}
                        />
                        Opção {optIdx + 1} {q.correctAnswer === optIdx && '✓'}
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                        placeholder={`Opção ${optIdx + 1}`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="form-group points-group">
                <label>Pontos</label>
                <input
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => handleQuestionChange(idx, 'points', parseInt(e.target.value || '0', 10))}
                />
              </div>
            </div>
          ))}

          <div className="footer">
            <div className="button-group">
              <button 
                type="button" 
                className="btn-delete-quiz" 
                onClick={handleDelete}
                disabled={saving}
              >
                🗑️ Excluir Quiz
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
