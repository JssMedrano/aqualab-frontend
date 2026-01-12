import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LayoutAuth from './LayoutAuth';
import './LoginComum.css'; // Reused for consistency
import './CadastroAluno.css';

export default function CadastroAluno() {
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    year: '',
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const { registerStudent, loading, error, clearError, getYearsPublic } = useAuth();
  const navigate = useNavigate();

  // Carregar anos disponíveis ao montar o componente
  useEffect(() => {
    let mounted = true;
    const loadYears = async () => {
      setYearsLoading(true);
      try {
        const result = await getYearsPublic();
        if (mounted && result.success) {
          const years = result.data || [];
          // Extrair apenas o número do ano e ordenar
          const yearNumbers = years
            .map(y => typeof y.year === 'number' ? y.year : parseInt(String(y.year), 10))
            .filter(y => Number.isFinite(y))
            .sort((a, b) => a - b);
          
          // Remover duplicatas
          const uniqueYears = [...new Set(yearNumbers)];
          setAvailableYears(uniqueYears);
          
          // Pré-selecionar o primeiro ano se houver algum
          if (uniqueYears.length > 0) {
            setFormData(prev => ({ ...prev, year: String(uniqueYears[0]) }));
          }
        }
      } catch (err) {
        console.error("Failed to load years", err);
        if (mounted) setAvailableYears([]);
      } finally {
        if (mounted) setYearsLoading(false);
      }
    };

    loadYears();
    return () => { mounted = false; };
  }, [getYearsPublic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!formData.name.trim() || !formData.enrollmentNumber.trim() || !formData.year) {
      // Basic validation handled by 'required' attribute mostly, but good to have
      return;
    }

    const result = await registerStudent(
      formData.name,
      parseInt(formData.enrollmentNumber),
      parseInt(formData.year)
    );

    if (result.success) {
      alert('Aluno registrado com sucesso!');
      navigate('/login-student');
    }
  };

  const handleBack = () => {
    navigate('/', { state: { openRoleModal: true, modalType: 'register' } });
  };

  return (
    <LayoutAuth 
      title="Registro Aluno" 
      backTo="/"
      onBack={handleBack}
      maxWidth="420px"
    >
      <h2 className="auth-title">Registrar Aluno</h2>
      <p className="auth-subtitle">Criar uma nova conta de aluno</p>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="name">Nome Completo</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="João Silva"
            disabled={loading}
            required
            aria-invalid={!!error}
          />
        </div>

        <div className="form-group">
          <label htmlFor="enrollmentNumber">Número de Matrícula</label>
          <input
            id="enrollmentNumber"
            type="number"
            name="enrollmentNumber"
            value={formData.enrollmentNumber}
            onChange={handleChange}
            placeholder="202401"
            disabled={loading}
            required
            aria-invalid={!!error}
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Ano Escolar</label>
          {availableYears.length > 0 ? (
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              disabled={loading || yearsLoading}
              required
              className="form-control" // Assuming LoginCommon might use generic input styles matching this
            >
              {yearsLoading && <option value="">Carregando turmas...</option>}
              {!yearsLoading && (
                <>
                  {availableYears.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}º Ano
                    </option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <input
              id="year"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Ex: 1, 2, 3..."
              min="1"
              max="10"
              disabled={loading || yearsLoading}
              required
            />
          )}
          
          {yearsLoading && (
            <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
              ⏳ Carregando turmas...
            </small>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Já tem conta?{' '}
          <Link to="/login-aluno" className="register-link">Faça Login</Link>
        </p>
      </div>
    </LayoutAuth>
  );
}
