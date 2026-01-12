import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LayoutAuth from './LayoutAuth';
import './LoginComum.css';
import './LoginProfessor.css';

export default function LoginProfessor() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginTeacher, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim()) return;

    const success = await loginTeacher(email, password);

    if (success) {
      navigate('/painel-professor');
    }
  };

  const handleBack = () => {
    navigate('/', { state: { openRoleModal: true, modalType: 'login' } });
  };

  return (
    <LayoutAuth 
      title="Login Professor" 
      onClose={() => navigate('/')}
      onBack={handleBack}
    >
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            disabled={loading}
            required
            aria-invalid={!!error}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
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
          <Link to="/register-teacher" className="register-link">Cadastre-se</Link>
        </p>
      </div>
    </LayoutAuth>
  );
}
