import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './QuizComum.css';
import './CriarQuiz.css';

export default function CriarQuiz() {
  const { user, userType, createQuiz, token, getYears } = useAuth();
  const navigate = useNavigate();

  const getTeacherId = () => {
    return user?.id ?? null;
  };

  const normalizeYearValue = (y) => {
    const raw = y?.year ?? y?.value ?? y;
    const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getYearOwnerId = (y) => {
    return (
      y?.teacherId ??
      y?.teacher_id ??
      y?.createdBy ??
      y?.ownerId ??
      y?.teacher?.id ??
      y?.teacher?.teacherId ??
      null
    );
  };

  const [availableYears, setAvailableYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    year: '',
    yearId: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }
    ]
  });

  useEffect(() => {
    const loadYears = async () => {
      if (!token || userType !== 'teacher') return;
      setYearsLoading(true);
      const result = await getYears();
      if (result.success) {
        const all = result.data || [];
        const teacherId = getTeacherId();

        // Confia que o backend já retorna os anos corretos para o professor.
        // Apenas ordena os resultados.
        const sortedYears = [...all].sort((a, b) => {
          const av = normalizeYearValue(a) ?? 0;
          const bv = normalizeYearValue(b) ?? 0;
          return av - bv;
        });

        console.log('📅 Anos disponíveis carregados:', sortedYears);
        sortedYears.forEach((y) => {
          console.log(`  - Ano ${y.year ?? y.value} (id: ${y.id}):`, y);
        });

        setAvailableYears(sortedYears);

        // Preselect first year if none selected yet
        if (!quizData.yearId && sortedYears.length > 0) {
          const firstYear = sortedYears[0];
          const firstVal = normalizeYearValue(firstYear);
          const firstId = firstYear?.id;

          if (firstVal && firstId) {
            setQuizData((prev) => ({ ...prev, year: firstVal, yearId: firstId }));
            console.log(`✅ Ano pré-selecionado: ${firstVal} (id: ${firstId})`);
          }
        }
      } else {
        setError(result.error || 'Não foi possível carregar os anos');
        console.error('❌ Erro ao carregar anos:', result.error);
      }

      setYearsLoading(false);
    };

    loadYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userType, user?.id]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'year') {
      // When controlled by yearId select, ignore direct edits
      return;
    }
    if (name === 'yearId') {
      const selected = availableYears.find((y) => String(y?.id) === String(value));
      const val = selected ? normalizeYearValue(selected) : '';
      setQuizData(prev => ({ ...prev, yearId: value, year: val }));
      return;
    }
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    // Se for correctAnswer ou points, converter para número
    if (field === 'correctAnswer' || field === 'points') {
      newQuestions[index][field] = typeof value === 'number' ? value : parseInt(String(value), 10);
    } else {
      newQuestions[index][field] = value;
    }
    setQuizData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const selectedYear = typeof quizData.year === 'number' ? quizData.year : parseInt(String(quizData.year), 10);
    const selectedYearId = quizData.yearId ? String(quizData.yearId) : '';
    if (!Number.isFinite(selectedYear) || selectedYear < 1 || !selectedYearId) {
      const message = 'Selecione um ano válido para o quiz.';
      setError(message);
      alert('❌ ' + message);
      return;
    }

    // Validação: verificar que o ano selecionado está na lista de anos disponíveis
    const selectedYearObj = availableYears.find((y) => String(y?.id) === String(selectedYearId));
    if (!selectedYearObj) {
      const message = `❌ O ano selecionado (${selectedYearId}) não está na sua lista de anos disponíveis. Recarregue a página ou crie um novo ano.`;
      setError(message);
      alert(message);
      console.error('⚠️ Ano selecionado não encontrado em availableYears:', selectedYearId);
      console.error('Anos disponíveis:', availableYears.map((y) => y?.id));
      return;
    }

    console.log('✅ Ano validado:', { id: selectedYearId, value: selectedYear, yearObj: selectedYearObj });

    // Validaciones
    if (!quizData.title.trim()) {
      setError('O título é obrigatório');
      return;
    }

    if (quizData.questions.length === 0) {
      setError('Deve adicionar pelo menos uma pergunta');
      return;
    }

    // Validar cada pergunta
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.question.trim()) {
        setError(`A pergunta ${i + 1} está vazia`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`A pergunta ${i + 1} tem opções vazias`);
        return;
      }
    }

    setLoading(true);

    // Backend espera: statement (não "question"), yearId (não "year"), options com isCorrect
    const normalizedQuestions = quizData.questions.map((q) => {
      const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
      
      // Converter options de array de strings para array de objetos com isCorrect
      const optionsWithCorrect = q.options.map((optText, idx) => ({
        text: optText,
        isCorrect: idx === correctIdx
      }));
      
      return {
        statement: q.question,  // ⚠️ Backend usa "statement", não "question"
        options: optionsWithCorrect
      };
    });

    // O backend espera: title, description, yearId (não "year"), questions com "statement"
    const payload = { 
      title: quizData.title,
      description: quizData.description,
      yearId: selectedYearId,  // ⚠️ Backend usa "yearId", não "year"
      questions: normalizedQuestions
    };

    console.log('Dados do quiz a enviar:', payload);

    const result = await createQuiz(payload);

    console.log('Resultado de createQuiz:', result);

    if (result.success) {
      setSuccess(true);
      alert('✅ Quiz criado com sucesso!');
      setTimeout(() => {
        navigate('/quizzes');
      }, 1500);
    } else {
      setError(result.error || 'Erro ao criar o quiz');
      alert('❌ Erro: ' + (result.error || 'Não foi possível criar o quiz'));
    }

    setLoading(false);
  };

  // Verificar autenticación
  if (!token || userType !== 'teacher') {
    return (
      <div className="create-quiz-container">
        <div className="create-quiz-box">
          <div className="access-denied">
            <h2>🔒 Acesso Negado</h2>
            <p>Apenas professores podem criar quizzes.</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Token: {token ? '✅' : '❌'} | Tipo: {userType || 'nenhum'}
            </p>
            <button onClick={() => navigate('/')}>Voltar ao Início</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-quiz-container">
      <div className="create-quiz-box">
        <div className="quiz-header">
          <button className="back-button" onClick={() => navigate('/painel-professor')}>
            ← Voltar
          </button>
          <h1 >📝 Criar Novo Quiz</h1>
          <p className="welcome-text">Professor: {user?.name}</p>
        </div>

        {success && (
          <div className="success-message">
            ✅ Quiz criado com sucesso! Redirecionando...
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Informação básica do quiz */}
          <div className="quiz-info-section">
            <div className="form-group">
              <label>Título do Quiz *</label>
              <input
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
                placeholder="Ex: Quiz de Matemática - Tema 1"
                required
              />
            </div>

            <div className="form-group">
              <label>Ano do Quiz *</label>
              <select
                name="yearId"
                value={quizData.yearId}
                onChange={handleInputChange}
                disabled={yearsLoading || availableYears.length === 0}
                required
              >
                {yearsLoading && <option value="">Carregando anos...</option>}
                {!yearsLoading && availableYears.length === 0 && <option value="">Não há anos disponíveis</option>}
                {!yearsLoading && availableYears.length > 0 &&
                  availableYears.map((y) => {
                    const value = normalizeYearValue(y);
                    const id = y?.id;
                    if (!value || !id) return null;
                    return (
                      <option key={String(id)} value={String(id)}>
                        {value}° Ano {id ? `(${id.substring(0, 8)}...)` : ''}
                      </option>
                    );
                  })}
              </select>
              <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                {availableYears.length === 0 
                  ? '❌ Não há anos criados por você. Crie um em "Gerenciar Anos".'
                  : `✅ ${availableYears.length} ano(s) disponível(is)`}
              </small>
              {!yearsLoading && availableYears.length === 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button type="button" className="add-question-btn" onClick={() => navigate('/gerenciar-anos')}>
                    + Criar um ano
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Perguntas */}
          <div className="questions-section">
            <div className="section-header">
              <h2>Perguntas</h2>
            </div>

            {quizData.questions.map((question, qIndex) => (
              <div key={qIndex} className="question-card">
                <div className="question-header">
                  <h3>Pergunta {qIndex + 1}</h3>
                </div>

                <div className="form-group">
                  <label>Enunciado *</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    placeholder="Escreva a pergunta aqui..."
                    rows="2"
                    required
                  />
                </div>

                <div className="options-grid">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-group">
                      <label>
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                        />
                        Opção {oIndex + 1} {question.correctAnswer === oIndex && '✓'}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Opção ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group points-group">
                  <label>Pontos</label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 10)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/painel-professor')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Criando...' : '✨ Criar Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
