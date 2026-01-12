import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RotaProtegida from './components/RotaProtegida'
import Inicio from './components/Inicio'
import LoginAluno from './components/LoginAluno'
import LoginProfessor from './components/LoginProfessor'
import CadastroAluno from './components/CadastroAluno'
import CadastroProfessor from './components/CadastroProfessor'
import PainelAluno from './components/PainelAluno'
import PainelProfessor from './components/PainelProfessor'
import CriarQuiz from './components/CriarQuiz'
import ListaQuizzes from './components/ListaQuizzes'
import QuizzesAluno from './components/QuizzesAluno'
import HistoricoQuizzes from './components/HistoricoQuizzes'
import ResponderQuiz from './components/ResponderQuiz'
import QuizzesProfessor from './components/QuizzesProfessor'
import EditarQuiz from './components/EditarQuiz'
import GerenciarAnos from './components/GerenciarAnos'
import DesempenhoAluno from './components/DesempenhoAluno'
import ResultadoQuiz from './components/ResultadoQuiz'
import VideosAluno from './components/VideosAluno'
import ArtigosAluno from './components/ArtigosAluno'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Inicio />} />
          <Route path="/login-aluno" element={<LoginAluno />} />
          <Route path="/login-professor" element={<LoginProfessor />} />
          <Route path="/cadastro-aluno" element={<CadastroAluno />} />
          <Route path="/cadastro-professor" element={<CadastroProfessor />} />

          {/* Student Routes */}
          <Route path="/painel-aluno" element={
            <RotaProtegida allowedRoles={['student']}>
              <PainelAluno />
            </RotaProtegida>
          } />
          <Route path="/quizzes-aluno" element={
            <RotaProtegida allowedRoles={['student']}>
              <QuizzesAluno />
            </RotaProtegida>
          } />
          <Route path="/videos-aluno" element={
            <RotaProtegida allowedRoles={['student']}>
              <VideosAluno />
            </RotaProtegida>
          } />
          <Route path="/artigos-aluno" element={
            <RotaProtegida allowedRoles={['student']}>
              <ArtigosAluno />
            </RotaProtegida>
          } />
          <Route path="/historico-quizzes" element={
            <RotaProtegida allowedRoles={['student']}>
              <HistoricoQuizzes />
            </RotaProtegida>
          } />
          <Route path="/responder-quiz/:quizId/:attemptId" element={
            <RotaProtegida allowedRoles={['student']}>
              <ResponderQuiz />
            </RotaProtegida>
          } />
          <Route path="/resultado-quiz/:attemptId" element={
            <RotaProtegida>
              <ResultadoQuiz />
            </RotaProtegida>
          } />

          {/* Teacher Routes */}
          <Route path="/painel-professor" element={
            <RotaProtegida allowedRoles={['teacher']}>
              <PainelProfessor />
            </RotaProtegida>
          } />
          <Route path="/criar-quiz" element={
            <RotaProtegida allowedRoles={['teacher']}>
              <CriarQuiz />
            </RotaProtegida>
          } />
          <Route path="/quizzes-professor" element={
            <RotaProtegida allowedRoles={['teacher']}>
              <QuizzesProfessor />
            </RotaProtegida>
          } />
          <Route path="/editar-quiz/:id" element={
            <RotaProtegida allowedRoles={['teacher']}>
              <EditarQuiz />
            </RotaProtegida>
          } />
          <Route path="/gerenciar-anos" element={
            <RotaProtegida allowedRoles={['teacher']}>
              <GerenciarAnos />
            </RotaProtegida>
          } />
          <Route path="/desempenho-aluno" element={
            <RotaProtegida allowedRoles={['teacher']}>
              <DesempenhoAluno />
            </RotaProtegida>
          } />

          {/* Shared/Other Routes */}
          <Route path="/lista-quizzes" element={
            <RotaProtegida>
              <ListaQuizzes />
            </RotaProtegida>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
