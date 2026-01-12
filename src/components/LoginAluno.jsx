import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Added Link
import LayoutAuth from './LayoutAuth';
import './LoginComum.css';
import './LoginAluno.css';

export default function LoginAluno() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const { loginStudent, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!enrollmentNumber.trim()) return;

    const success = await loginStudent(parseInt(enrollmentNumber));

    if (success) {
      navigate('/painel-aluno');
    }
  };

  const handleBack = () => {
    navigate('/', { state: { openRoleModal: true, modalType: 'login' } });
  };

  return (
    <LayoutAuth 
      title="Login Aluno" 
      onClose={() => navigate('/')}
      onBack={handleBack}
    >
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="enrollment">Matrícula</label>
          <input
            id="enrollment"
            type="number"
            value={enrollmentNumber}
            onChange={(e) => setEnrollmentNumber(e.target.value)}
            placeholder="Digite sua matrícula"
            disabled={loading}
            required
            aria-invalid={!!error}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Entrando...' : 'ENTRAR'}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Você não tem conta?{' '}
          <Link to="/register-student" className="register-link">Cadastre-se</Link>
        </p>
      </div>
    </LayoutAuth>
  );
}
