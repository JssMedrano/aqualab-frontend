import { useState, useEffect } from "react"; // Added useEffect
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAuth } from "../contexts/AuthContext";
import ModalSelecao from "./ModalSelecao";
import "./Inicio.css";
import backgroundImg from "../assets/background.png";
import videoImportancia from "../assets/Importancia.mp4";
import videoCiclo from "../assets/Ciclo.mp4";
import videoEconomizar from "../assets/Economizar.mp4";
import bookmarkIcon from "../assets/bookmark-icon.png";
import LogoSinFondo from "../assets/LogoSinFondo.svg";

export default function Inicio() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook location
  const { isAuthenticated, logout, userType } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'login' o 'register'

  // Efecto para abrir el modal si viene del estado de navegación
  useEffect(() => {
    if (location.state?.openRoleModal) {
      setTimeout(() => {
        setModalType(location.state.modalType);
        setShowRoleModal(true);
        // Limpar o estado para evitar reabrir ao navegar internamente (opcional, mas boa prática)
        window.history.replaceState({}, document.title);
      }, 0);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  const handleOpenLoginModal = () => {
    setModalType("login");
    setShowRoleModal(true);
  };

  const handleOpenRegisterModal = () => {
    setModalType("register");
    setShowRoleModal(true);
  };

  const handleSelectRole = (role) => {
    setShowRoleModal(false);
    if (modalType === "login") {
      navigate(role === "professor" ? "/login-professor" : "/login-aluno");
    } else if (modalType === "register") {
      navigate(
        role === "professor" ? "/cadastro-professor" : "/cadastro-aluno"
      );
    }
  };

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="nav-brand">
          <div className="logo"><img src={LogoSinFondo} alt="Aqualab Logo" /></div>
          <h1 className="logo-text">Aqualab </h1>
        </div>

        <div className="nav-links">
          <a href="#inicio">Início</a>
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#videos">Vídeos</a>
          <a href="#conteudo">Conteúdo</a>
        </div>

        <div className="nav-buttons">
          {isAuthenticated ? (
            <>
              <button
                className="btn-dashboard"
                onClick={() =>
                  navigate(
                    userType === "student"
                      ? "/painel-aluno"
                      : "/painel-professor"
                  )
                }
              >
                Dashboard
              </button>
              <button onClick={handleLogout} className="btn-logout">
                Sair
              </button>
            </>
          ) : (
            <>
              <button className="btn-entrar" onClick={handleOpenLoginModal}>
                Entrar
              </button>
              <button
                className="btn-cadastrar"
                onClick={handleOpenRegisterModal}
              >
                Cadastrar
              </button>
            </>
          )}
        </div>
      </nav>

      <section
        className="hero-section"
        id="inicio"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title">
            Bem-vindo ao <span className="highlight-aqualab">Aqualab</span>
          </h1>
          <p className="hero-subtitle">
            Explore o mundo com nossos conteúdos interativos, vídeos educativos
            e jogos divertidos.
          </p>
        </div>
      </section>

      <section className="content-areas-section" id="conteudo">
        <h2 className="section-title">Áreas de Conteúdo</h2>
        <p className="section-subtitle">
          Explore tópicos diferentes sobre a água
        </p>

        <div className="content-cards">
          <div className="content-card">
            <div className="content-card-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <h3>Conteúdo Interativo</h3>
            <p>Aprenda sobre a água de forma divertida e interativa.</p>
            <a
            onClick={handleOpenRegisterModal}  
            className="content-link">
              → Ver mais
            </a>
            
          </div>

          <div className="content-card">
            <div className="content-card-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            </div>
            <h3>Vídeos Educativos</h3>
            <p>Assista a vídeos que ensinam sobre a importância da água.</p>
            <a onClick={handleOpenRegisterModal} className="content-link">
              → Ver mais
            </a>
          </div>

          <div className="content-card">
            <div className="content-card-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01M8 6h8M8 10h8M8 14h5" />
              </svg>
            </div>
            <h3>Jogos Educativos</h3>
            <p>Divirta-se enquanto aprende com nossos jogos.</p>
            <a onClick={handleOpenRegisterModal} className="content-link">
              → Ver mais
            </a>
          </div>
        </div>
      </section>

      <section className="videos-section" id="videos">
        <h2 className="section-title">Vídeos Educativos</h2>
        <p className="section-subtitle">
          Aprenda assistindo conteúdo interativo
        </p>

        <div className="videos-grid">
          <div className="video-card">
            <div className="video-thumbnail">
              <video className="video-preview" controls>
                <source src={videoImportancia} type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
            <div className="video-info">
              <h3>A Importância da Água</h3>
              <p>
                A água é essencial para toda a vida no planeta. Ela sustenta os
                ecossistemas, regula o clima e é vital para a saúde humana, a
                agricultura e a indústria. Sua preservação é urgente.
              </p>
              <div className="video-meta">
                <span>1 min</span>
                <img
                  className="bookmark-icon"
                  src={bookmarkIcon}
                  alt="Bookmark Icon"
                />
              </div>
            </div>
          </div>

          <div className="video-card">
            <div className="video-thumbnail">
              <video className="video-preview" controls>
          <source src={videoCiclo} type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>
            </div>
            <div className="video-info">
              <h3>O Ciclo da Água</h3>
              <p>
                A água está em movimento contínuo. O ciclo da água entre a
                terra, o mar e a atmosfera, através de evaporação, condensação,
                precipitação e infiltração. Um processo natural essencial para a
                manutenção da vida e a disponibilidade para todos os seres
                vivos.
              </p>
              <div className="video-meta">
                <span>3 min</span>
                <img
                  className="bookmark-icon"
                  src={bookmarkIcon}
                  alt="Bookmark Icon"
                />
              </div>
            </div>
          </div>

          <div className="video-card">
            <div className="video-thumbnail">
              <video className="video-preview" controls>
                <source src={videoEconomizar} type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
            <div className="video-info">
              <h3>Dicas para Economizar Água</h3>
              <p>
                Apesar de parecer abundante, a água doce disponível é um recurso
                limitado e essencial. Economizar água garante sua
                disponibilidade para as futuras gerações, reduz o impacto
                ambiental, preservando os ecossistemas.
              </p>
              <div className="video-meta">
                <span>3 min</span>
                <img
                  className="bookmark-icon"
                  src={bookmarkIcon}
                  alt="Bookmark Icon"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="funcionalidades">
        <h2 className="section-title">Funcionalidades</h2>
        <p className="section-subtitle">
          Tudo o que você precisa para ensinar e aprender sobre a água.
        </p>

        <div className="features-grid-two-columns">
          <div className="features-column">
            <div className="column-header">
              <div className="column-icon">👨‍🏫</div>
              <h3 className="column-title professor">Professor</h3>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon blue">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    d="M12 6v6l4 2"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="feature-item-content">
                <h4>Slides de Conteúdo</h4>
                <p>Biblioteca de apresentações prontas.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon blue">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-10-7l3 3 5-5" />
                </svg>
              </div>
              <div className="feature-item-content">
                <h4>Acompanhamento</h4>
                <p>Veja o progresso da turma.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon blue">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path
                    d="M9 9h6M9 12h6M9 15h3"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="feature-item-content">
                <h4>Quiz Personalizado</h4>
                <p>Crie perguntas customizadas.</p>
              </div>
            </div>
          </div>

          <div className="features-column">
            <div className="column-header">
              <div className="column-icon">🎓</div>
              <h3 className="column-title aluno">Aluno</h3>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon pink">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="feature-item-content">
                <h4>Quiz Interativo</h4>
                <p>Responda e aprenda brincando!</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon pink">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="feature-item-content">
                <h4>Artigos</h4>
                <p>Aprenda com artigos curtos.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon pink">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path
                    d="M8 12h8M12 8v8"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="feature-item-content">
                <h4>Desafios</h4>
                <p>
                  Teste seu conhecimento e se aprimore com desafios semanais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <ModalSelecao
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelectRole={handleSelectRole}
        type={modalType}
      />
    </div>
  );
}
