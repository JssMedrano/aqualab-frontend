import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './QuizzesProfessor.css';

export default function QuizzesProfessor() {
  const { user, token, userType, getTeacherQuizzes, deleteQuiz } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = token && userType === 'teacher';
  const teacherId = user?.id;

  const totalCount = useMemo(() => quizzes?.length || 0, [quizzes]);

  const load = async () => {
    setLoading(true);
    setError('');

    if (!canManage) {
      setError('Apenas professores podem ver seus quizzes.');
      setLoading(false);
      return;
    }

    const result = await getTeacherQuizzes(teacherId);
    if (result.success) {
      setQuizzes(result.data || []);
    } else {
      setError(result.error || 'Erro ao carregar quizzes do professor');
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, canManage]);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Excluir este quiz?')) return;
    const result = await deleteQuiz(quizId);
    if (result.success) {
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } else {
      alert('❌ ' + (result.error || 'Não foi possível excluir'));
    }
  };

  if (loading) {
    return (
      <div className="teacher-quiz-list-container">
        <div className="teacher-quiz-list-box">
          <div className="loading">Carregando seus quizzes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-quiz-list-container">
      <div className="teacher-quiz-list-box">
        <div className="list-header">
          <div>
            <h1>📘 Meus Quizzes</h1>
            <p className="subtitle">Total: {totalCount}</p>
          </div>
          <div className="header-actions">
            <button className="btn-create" onClick={() => navigate('/criar-quiz')}>
              + Criar Quiz
            </button>
            <button className="btn-back" onClick={() => navigate('/painel-professor')}>
              ← Voltar
            </button>
          </div>
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <p>📭 Você ainda não criou nenhum quizz.</p>
          </div>
        ) : (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                  <span className="year-badge">Ano: {quiz.year?.year ?? quiz.year}</span>
                </div>

                <div className="quiz-card-body">
                  <p className="description">{quiz.description}</p>
                  <div className="meta">
                    <span>❓ {quiz.questions?.length || 0} perguntas</span>
                  </div>
                </div>

                        
                <div className="quiz-card-footer">
                  <button className="btn-edit" onClick={() => navigate(`/editar-quiz/${quiz.id}`)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(quiz.id)}>
                    🗑️ Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
