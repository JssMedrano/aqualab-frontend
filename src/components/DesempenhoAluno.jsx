import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DesempenhoAluno.css';

export default function DesempenhoAluno() {
  const { getStudents, getQuizzes, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Carregar estudantes e quizzes
      const [studentsResult, quizzesResult] = await Promise.all([
        getStudents(),
        getQuizzes()
      ]);

      if (studentsResult.success) {
        // Agregar informação de quizzes completados do localStorage
        const studentsWithPerformance = studentsResult.data.map(student => {
          const completedQuizzesKey = `completedQuizzes_${student.id}`;
          const completedQuizzes = JSON.parse(localStorage.getItem(completedQuizzesKey) || '[]');
          
          return {
            ...student,
            completedQuizzes,
            totalCompleted: completedQuizzes.length,
            averageScore: completedQuizzes.length > 0
              ? Math.round(
                  completedQuizzes.reduce((sum, q) => {
                    const score = q.score || 0;
                    const total = q.totalPoints || 100;
                    return sum + (score / total) * 100;
                  }, 0) / completedQuizzes.length
                )
              : 0
          };
        });
        
        setStudents(studentsWithPerformance);
        console.log('👥 Estudantes com desempenho:', studentsWithPerformance);
      }

      if (quizzesResult.success) {
        setQuizzes(quizzesResult.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      console.error('Error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentIdParam = params.get('studentId');
    setSelectedStudentId(studentIdParam);

    if (studentIdParam && students.length > 0) {
      const student = students.find(s => s.id === studentIdParam);
      if (student) {
        const studentYear = typeof student.year === 'object' ? student.year.year : student.year;
        if (studentYear) {
          setSelectedYear(String(studentYear));
        }
      }
    }
  }, [location.search, students]);

  // Filtrar estudantes por ano
  const filteredStudents = selectedStudentId
    ? students.filter(s => s.id === selectedStudentId)
    : selectedYear === 'all'
      ? students
      : students.filter(s => {
          const studentYear = typeof s.year === 'object' ? s.year.year : s.year;
          return String(studentYear) === String(selectedYear);
        });

  // Obter anos únicos
  const years = [...new Set(students.map(s => 
    typeof s.year === 'object' ? s.year.year : s.year
  ).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="performance-container">
        <div className="loading">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="performance-container">
      <div className="performance-box">
        <div className="performance-header">
          <div>
            <h1>📊 Desempenho de Estudantes</h1>
            <p className="subtitle">Professor: {user?.name}</p>
          </div>
          <button 
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Filtro por Ano */}
        <div className="filter-section">
          <label>Filtrar por Ano:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-filter"
            disabled={!!selectedStudentId}
          >
            <option value="all">Todos os anos</option>
            {years.map(year => (
              <option key={year} value={year}>Ano {year}</option>
            ))}
          </select>
          <span className="student-count">
            {filteredStudents.length} estudante{filteredStudents.length !== 1 ? 's' : ''}
            {selectedStudentId && ' (filtrado por aluno)'}
          </span>
        </div>

        {/* Resumen General */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">👥</div>
            <div className="summary-content">
              <div className="summary-value">{filteredStudents.length}</div>
              <div className="summary-label">Estudantes</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">📚</div>
            <div className="summary-content">
              <div className="summary-value">{quizzes.length}</div>
              <div className="summary-label">Quizzes Disponíveis</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-value">
                {filteredStudents.reduce((sum, s) => sum + s.totalCompleted, 0)}
              </div>
              <div className="summary-label">Quizzes Completados</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">⭐</div>
            <div className="summary-content">
              <div className="summary-value">
                {filteredStudents.length > 0
                  ? Math.round(
                      filteredStudents.reduce((sum, s) => sum + s.averageScore, 0) / 
                      filteredStudents.length
                    )
                  : 0}%
              </div>
              <div className="summary-label">Média Geral</div>
            </div>
          </div>
        </div>

        {/* Tabla de Estudiantes */}
        <div className="students-table-container">
          <h2>📋 Detalhe por Estudante</h2>
          
          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <p>Não há estudantes{selectedYear !== 'all' ? ` no Ano ${selectedYear}` : ''}</p>
            </div>
          ) : (
            <div className="students-grid">
              {filteredStudents.map(student => (
                <div key={student.id} className="student-card">
                  <div className="student-card-header">
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      <p className="student-details">
                        Matrícula: {student.enrollmentNumber} | 
                        Ano: {typeof student.year === 'object' ? student.year.year : student.year}
                      </p>
                    </div>
                    <div className="student-score">
                      <div className="score-circle" style={{
                        borderColor: student.averageScore >= 80 ? '#28a745' : 
                                    student.averageScore >= 60 ? '#ffc107' : '#dc3545'
                      }}>
                        <div className="score-number">{student.averageScore}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="student-card-body">
                    <div className="stat-row">
                      <span className="stat-label">Quizzes Completos:</span>
                      <span className="stat-value">{student.totalCompleted}</span>
                    </div>

                    {student.completedQuizzes.length > 0 && (
                      <div className="quiz-list">
                        <h4>Resultados por Quiz:</h4>
                        {student.completedQuizzes.map((quiz, idx) => {
                          const percentage = quiz.totalPoints > 0 
                            ? Math.round((quiz.score / quiz.totalPoints) * 100)
                            : 0;
                          
                          return (
                            <div key={idx} className="quiz-result">
                              <div className="quiz-result-header">
                                <span className="quiz-title">{quiz.quizTitle || 'Quiz'}</span>
                                <span className="quiz-score">{quiz.score}/{quiz.totalPoints}</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: percentage >= 80 ? '#28a745' : 
                                                    percentage >= 60 ? '#ffc107' : '#dc3545'
                                  }}
                                />
                              </div>
                              <div className="quiz-meta">
                                <span>{percentage}%</span>
                                <span className="quiz-date">
                                  {new Date(quiz.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {student.completedQuizzes.length === 0 && (
                      <div className="no-results">
                        <p>📭 Não concluiu nenhum questionário</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
