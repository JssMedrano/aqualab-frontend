import { useState } from 'react';
import './ModalSelecao.css';

export default function ModalSelecao({ isOpen, onClose, onSelectRole, type = 'login' }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelect = (role) => {
    setSelectedRole(role);
    onSelectRole(role);
  };

  if (!isOpen) return null;

  const title = type === 'login' ? 'Escolha uma opção' : 'Escolha uma opção';

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="role-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="modal-title">{title}</h2>

        <div className="role-options">
          <button
            className={`role-option professor ${selectedRole === 'professor' ? 'selected' : ''}`}
            onClick={() => handleSelect('professor')}
          >
            <div className="role-avatar">
              <div className="avatar-icon">👨‍🏫</div>
            </div>
            <h3>PROFESSOR</h3>
          </button>

          <button
            className={`role-option aluno ${selectedRole === 'aluno' ? 'selected' : ''}`}
            onClick={() => handleSelect('aluno')}
          >
            <div className="role-avatar">
              <div className="avatar-icon">👨‍🎓</div>
            </div>
            <h3>ALUNO</h3>
          </button>
        </div>
      </div>
    </>
  );
}
