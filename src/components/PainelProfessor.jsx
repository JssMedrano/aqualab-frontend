import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImg from '../assets/background.png';
import ModalResumo from './ModalResumo';
import './PainelProfessor.css';

export default function PainelProfessor() {
  const { user, logout, getStudents, getTeacherQuizzes, getYears } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    filterType: 'year',
    sortOrder: 'asc',
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalYears: 0,
    completedQuizzes: 0,
    incompleteQuizzes: 0,
  });
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carregar estudantes
        const studentsResult = await getStudents();
        if (studentsResult.success) {
          setStudents(studentsResult.data || []);
          setStats(prev => ({
            ...prev,
            totalStudents: studentsResult.data?.length || 0
          }));
        }
  
        // Carregar anos escolares
        const yearsResult = await getYears();
        if (yearsResult.success) {
          const allYears = yearsResult.data || [];
          setStats(prev => ({
            ...prev,
            totalYears: allYears.length || 0
          }));
        }
  
        // Carregar quizzes do professor
        const quizzesResult = await getTeacherQuizzes(user?.id);
        if (quizzesResult.success) {
          const allQuizzes = quizzesResult.data || [];
          setQuizzes(allQuizzes);
          
          // Calcular quizzes completados e incompletos
          let completed = 0;
          let incomplete = 0;
          
          allQuizzes.forEach(quiz => {
            // Se tiver respostas, assumimos que há pelo menos um completado
            if (quiz.responses && quiz.responses.length > 0) {
              completed += quiz.responses.filter(r => r.completed).length;
              incomplete += quiz.responses.filter(r => !r.completed).length;
            }
          });
  
          setStats(prev => ({
            ...prev,
            completedQuizzes: completed,
            incompleteQuizzes: incomplete
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, filters]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleStudentPerformance = (studentId) => {
    if (!studentId) return;
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
    }
  };

  const applyFilters = () => {
    let result = [...students];

    // Filtro por búsqueda (nombre o matrícula)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name?.toLowerCase().includes(searchLower) ||
        student.enrollmentNumber?.toString().includes(searchLower)
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      let valueA, valueB;

      if (filters.filterType === 'year') {
        valueA = (typeof a.year === 'object' ? a.year.year : a.year) || 0;
        valueB = (typeof b.year === 'object' ? b.year.year : b.year) || 0;
      } else {
        valueA = a.enrollmentNumber || 0;
        valueB = b.enrollmentNumber || 0;
      }

      if (valueA < valueB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStudents(result);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="teacher-home" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="teacher-overlay"></div>

      <div className="teacher-container">
        {/* Header */}
        <header className="teacher-header">
          <div className="header-left">
            <h1>Dashboard do Professor</h1>
            <p className="subtitle">Acompanhamento e gestão das suas turmas da escola E.E. Barão de Ramalho</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.name || 'Professor'}</span>
              <span className="user-subject">{user?.email}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Sair
            </button>
          </div>
        </header>

        {/* Action Buttons - Below Header */}
        <section className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => handleNavigate('/criar-quiz')}
          >
            📝 Criar Quiz
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => handleNavigate('/quizzes-professor')}
          >
            📘 Ver todos os meus Quizzes
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => handleNavigate('/gerenciar-anos')}
          >
            🗓️ Gerenciar Turmas
          </button>
        </section>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#1976d2' }}>👥</div>
            <div className="stat-content">
              <h3>Total de Estudantes</h3>
              <p className="stat-number">{stats.totalStudents}</p>
              <span className="stat-detail">+{Math.floor(stats.totalStudents * 0.1)} este mês</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#4caf50' }}>📚</div>
            <div className="stat-content">
              <h3>Turmas</h3>
              <p className="stat-number">{stats.totalYears}</p>
              <span className="stat-detail">Turmas criadas</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#9c27b0' }}>✅</div>
            <div className="stat-content">
              <h3>Quizzes Completados</h3>
              <p className="stat-number">{stats.completedQuizzes}</p>
              <span className="stat-detail">Respostas completadas</span>
            </div>
          </div>

          {stats.incompleteQuizzes > 0 && (
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ff9800' }}>⏰</div>
              <div className="stat-content">
                <h3>Quizzes Incompletos</h3>
                <p className="stat-number">{stats.incompleteQuizzes}</p>
                <span className="stat-detail">Requer atenção</span>
              </div>
            </div>
          )}
        </section>

        {/* Main Content */}
        <div className="teacher-content">
          {/* Mis Clases */}
          <section className="content-section">
            <div className="section-header">
              <h2>Meus Quizzes</h2>
              <p className="section-subtitle">Selecione um quiz para ver detalhes</p>
            </div>

            {loading ? (
              <div className="loading">Carregando quizzes...</div>
            ) : quizzes.length > 0 ? (
              <div className="quizzes-list">
                {quizzes.slice(0, 6).map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="quiz-card"
                    onClick={() => handleNavigate(`/quizzes-professor`)}
                    style={{ cursor: 'pointer' }}
                    title="Clique para gerenciar seus quizzes"
                  >
                    <div className="quiz-header">
                      <h4 className="quiz-title">{quiz.title || `Quiz ${quiz.id?.substring(0, 6)}`}</h4>
                      <span className="quiz-badge">
                        3 perguntas
                      </span>
                    </div>
                    {/* Descrição removida conforme solicitado */}
                    <div className="quiz-meta">
                      <span className="meta-item">
                        📝 3 perguntas
                      </span>
                      {quiz.year && (
                        <span className="meta-item">
                           📅 Ano: {typeof quiz.year === 'object' ? quiz.year.year : quiz.year}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Nenhum quiz foi criado ainda.</p>
                <button 
                  className="btn-action"
                  onClick={() => handleNavigate('/criar-quiz')}
                >
                  📝 Criar Quiz
                </button>
              </div>
            )}
          </section>

          {/* Lista de Estudantes */}
          <section className="content-section">
            <div className="section-header">
              <h2>Estudantes</h2>
              <p className="section-subtitle">Controle dos seus alunos</p>
            </div>

            {/* Filtros em linha */}
            <div className="students-filter-bar">
              <div className="filter-search">
                <span className="filter-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar turma..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="filter-input"
                />
              </div>

              <select
                value={filters.filterType}
                onChange={(e) => handleFilterChange('filterType', e.target.value)}
                className="filter-select"
              >
                <option value="year">Ano</option>
                <option value="enrollment">Matrícula</option>
              </select>

              <button
                className="sort-btn"
                onClick={toggleSortOrder}
                title={filters.sortOrder === 'asc' ? 'Decrescente' : 'Crescente'}
              >
                {filters.sortOrder === 'asc' ? '📅⬆️' : '📅⬇️'}
              </button>

              <button
                className="filter-apply-btn"
                onClick={() => applyFilters()}
              >
                Aplicar
              </button>
            </div>

            {loading ? (
              <div className="loading">Carregando estudantes...</div>
            ) : filteredStudents.length > 0 ? (
              <div className="students-table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Matrícula</th>
                      <th>Ano</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.slice(0, 8).map((student) => (
                      <tr
                        key={student.id}
                        className="student-row"
                        onClick={() => handleStudentPerformance(student.id)}
                      >
                        <td className="student-name">
                          <span className="avatar">{student.name.charAt(0)}</span>
                          {student.name}
                        </td>
                        <td>{student.enrollmentNumber}</td>
                        <td>{student.year?.year || 'N/A'}</td>
                        <td>
                          <span className="status-badge active">Ativo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>Não há estudantes com os filtros aplicados</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedStudent && (
        <ModalResumo
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
