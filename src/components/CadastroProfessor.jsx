import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LayoutAuth from './LayoutAuth';
import './LoginComum.css';
import './CadastroProfessor.css';

export default function CadastroProfessor() {
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const { registerTeacher, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro de senha
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      return;
    }

    // Validar senhas
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 5) {
      setPasswordError('A senha deve ter no mínimo 5 caracteres');
      return;
    }

    const result = await registerTeacher(
      formData.name,
      parseInt(formData.enrollmentNumber),
      formData.email,
      formData.password
    );

    if (result.success) {
      alert('Professor registrado com sucesso!');
      navigate('/login-teacher');
    }
  };

  const handleBack = () => {
    navigate('/', { state: { openRoleModal: true, modalType: 'register' } });
  };

  return (
    <LayoutAuth 
      title="Registro Professor" 
      backTo="/"
      onBack={handleBack}
      maxWidth="420px"
    >
      <h2 className="auth-title">Registrar Professor</h2>
      <p className="auth-subtitle">Criar uma nova conta de professor</p>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {passwordError && <div className="alert alert-error" role="alert">{passwordError}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="name">Nome Completo</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Carlos Silva"
            disabled={loading}
            required
            aria-invalid={!!error}
          />
        </div>

        <div className="form-group">
          <label htmlFor="enrollmentNumber">Número de Registro</label>
          <input
            id="enrollmentNumber"
            type="number"
            name="enrollmentNumber"
            value={formData.enrollmentNumber}
            onChange={handleChange}
            placeholder="789001"
            disabled={loading}
            required
            aria-invalid={!!error}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="professor@example.com"
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
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 5 caracteres"
            disabled={loading}
            required
            aria-invalid={!!passwordError}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar senha</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar senha"
            disabled={loading}
            required
            aria-invalid={!!passwordError}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Já tem conta?{' '}
          <Link to="/login-professor" className="register-link">Faça Login</Link>
        </p>
      </div>
    </LayoutAuth>
  );
}
