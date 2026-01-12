import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import backgroundImg from '../assets/background.png';
import './LoginComum.css'; // Reused as it contains base styles

export default function LayoutAuth({ title, children, showBack = true, backTo = '/', onClose, maxWidth = '400px', onBack }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(backTo);
    }
  };
  const handleClose = () => onClose ? onClose() : navigate('/');

  return (
    <div className="login-page" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="login-overlay"></div>
      
      <div className="login-modal" style={{ maxWidth }}>
        <div className="modal-header">
          {showBack && (
            <button className="btn-back" onClick={handleGoBack} title="Voltar" type="button">
              ← {title}
            </button>
          )}
          <button className="btn-close" onClick={handleClose} type="button" aria-label="Fechar">
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

LayoutAuth.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  showBack: PropTypes.bool,
  backTo: PropTypes.string,
  onClose: PropTypes.func,
  onBack: PropTypes.func,
  maxWidth: PropTypes.string,
};
