import { useMemo, useState } from 'react'
import './VideosAluno.css'
import LayoutAluno from './LayoutAluno'

// Importando os vídeos da pasta assets
import vidCiclo from '../assets/Ciclo.mp4'
import vidEconomizar from '../assets/Economizar.mp4'
import vidImportancia from '../assets/Importancia.mp4'

// Importando vídeos numerados (Simulando uma coleção de registros/aulas)
// Nota: Em um projeto real, isso seria dinâmico ou renomeado.
import vid01 from '../assets/video_2026-01-11_15-54-59.mp4'
import vid02 from '../assets/video_2026-01-11_15-55-08.mp4'
import vid03 from '../assets/video_2026-01-11_15-55-10.mp4'
import vid04 from '../assets/video_2026-01-11_15-55-13.mp4'
import vid05 from '../assets/video_2026-01-11_15-55-16.mp4'
import vid06 from '../assets/video_2026-01-11_15-55-18.mp4'
import vid07 from '../assets/video_2026-01-11_15-55-20.mp4'
import vid08 from '../assets/video_2026-01-11_15-55-22.mp4'
import vid09 from '../assets/video_2026-01-11_15-55-24.mp4'
import vid10 from '../assets/video_2026-01-11_15-55-26.mp4'
import vid11 from '../assets/video_2026-01-11_15-55-29.mp4'
import vid12 from '../assets/video_2026-01-11_15-55-31.mp4'
import vid13 from '../assets/video_2026-01-11_15-55-33.mp4'
import vid14 from '../assets/video_2026-01-11_15-55-36.mp4'
import vid15 from '../assets/video_2026-01-11_15-55-38.mp4'
import vid16 from '../assets/video_2026-01-11_15-55-42.mp4'

const listaVideos = [
  {
    id: 1,
    titulo: 'Análise de pH da Água',
    topico: 'Química',
    duracao:'03:50' ,
    nivel: 'Intermediário',
    humor: '⚗️',
    descricao: 'Experimento químico fundamental para determinar a acidez da água. Aprenda a usar indicadores de pH e entenda o que os resultados revelam sobre a qualidade da água e sua adequação para a vida aquática.',
    source: vid06,
    materiais: []
  },
  {
    id: 2,
    titulo: 'A Importância da Água',
    topico: 'Ecologia',
    duracao: '10:05',
    nivel: 'Intermediário',
    humor: '💧',
    descricao: 'Uma visão abrangente sobre o papel vital da água. Descubra como ela sustenta ecossistemas inteiros, impulsiona a agricultura e a indústria, e por que a preservação dos recursos hídricos é a chave para o futuro da humanidade.',
    source: vidImportancia,
    materiais: []
  },
  {
    id: 3,
    titulo: 'Como Economizar Água',
    topico: 'Sustentabilidade',
    duracao: '07:44',
    nivel: 'Básico',
    humor: '🌱',
    descricao: 'Transforme sua rotina com dicas práticas e impactantes de economia. Aprenda técnicas simples para reduzir o desperdício em casa e na escola, contribuindo diretamente para a preservação deste recurso precioso.',
    source: vidEconomizar,
    materiais: []
  },
  {
    id: 4,
    titulo: 'Experimento: Tensão superficial',
    topico: 'Laboratório',
    duracao: '03:20',
    nivel: 'Prático',
    humor: '🧪',
    descricao: 'Teste prático em laboratório demonstrando a "pele" invisível da água. Observe como as moléculas de água se unem fortemente na superfície, permitindo fenômenos curiosos como insetos caminhando sobre ela.',
    source: vid01,
    materiais: []
  },
  {
    id: 5,
    titulo: 'Observação Microscópica I',
    topico: 'Biologia',
    duracao: '04:15',
    nivel: 'Avançado',
    humor: '🔬',
    descricao: 'Mergulhe no mundo invisível de uma gota d\'água. Analise amostras coletadas em rios através das lentes de um microscópio e descubra a rica biodiversidade de micro-organismos que habitam nossos mananciais.',
    source: vid02,
    materiais: []
  },
  {
    id: 6,
    titulo: 'Tratamento de Água',
    topico: 'Tecnologia',
    duracao: '05:30',
    nivel: 'Intermediário',
    humor: '⚙️',
    descricao: 'Conheça os bastidores de uma estação de tratamento. Veja passo a passo como a água bruta captada nos rios passa por processos complexos de purificação até se tornar segura e cristalina para o consumo em nossas torneiras.',
    source: vid03,
    materiais: []
  },
  { id: 7, titulo: 'Coleta de Amostras - Parte 1', topico: 'Campo', duracao: '02:10', nivel: 'Básico', humor: '📋', descricao: 'Acompanhe a primeira etapa da nossa expedição de campo. Veja os alunos aplicando técnicas corretas para coletar água do rio, garantindo que as amostras sejam representativas para análise laboratorial.', source: vid04, materiais: [] },
  { id: 8, titulo: 'Coleta de Amostras - Parte 2', topico: 'Campo', duracao: '02:45', nivel: 'Básico', humor: '📋', descricao: 'Continuação do trabalho de campo em diferentes pontos de coleta. Entenda a importância de variar os locais de amostragem para obter um panorama completo da saúde do ecossistema aquático local.', source: vid05, materiais: [] },
  { id: 9, titulo: 'O ciclo da água',topico: 'Ciências', duracao: '08:12',nivel: 'Básico',humor: '🌊',descricao: 'Explore a fascinante jornada da água na Terra. Entenda detalhadamente como a evaporação dos oceanos, a condensação nas nuvens e a precipitação trabalham juntas para manter a vida no nosso planeta através de um ciclo contínuo.',source: vidCiclo,materiais: [] },
  { id: 10, titulo: 'Turbidez e Clareza', topico: 'Química', duracao: '04:00', nivel: 'Intermediário', humor: '👁️', descricao: 'Avaliação visual e técnica da transparência da água. Descubra como partículas em suspensão afetam a qualidade da água e o que a turbidez pode indicar sobre erosão ou poluição nas proximidades.', source: vid07, materiais: [] },
  { id: 11, titulo: 'Vida Aquática: Peixes', topico: 'Biologia', duracao: '06:12', nivel: 'Básico', humor: '🐟', descricao: 'Um olhar atento sobre a fauna local. Observe o comportamento das espécies de peixes nativos e entenda como a presença (ou ausência) de certas espécies serve como um bioindicador da saúde do rio.', source: vid08, materiais: [] },
  { id: 12, titulo: 'Vida Aquática: Plantas', topico: 'Biologia', duracao: '05:45', nivel: 'Básico', humor: '🌿', descricao: 'Explore a importância crítica da mata ciliar. Veja como a vegetação nas margens protege o rio contra o assoreamento, filtra poluentes e fornece abrigo essencial para a fauna aquática.', source: vid09, materiais: [] },
  { id: 13, titulo: 'Poluição: Identificação', topico: 'Ecologia', duracao: '04:30', nivel: 'Intermediário', humor: '⚠️', descricao: 'Aprenda a ser um detetive ambiental. Identifique sinais visíveis e invisíveis de contaminação na água, desde o descarte irregular de lixo até indícios químicos mais sutis que ameaçam o ecossistema.', source: vid10, materiais: [] },
  { id: 14, titulo: 'Poluição: Consequências', topico: 'Ecologia', duracao: '05:00', nivel: 'Avançado', humor: '☠️', descricao: 'Uma análise séria sobre os impactos do descarte incorreto. Entenda como o lixo e o esgoto não tratado afetam não apenas a vida marinha, mas também a saúde pública e a economia local.', source: vid11, materiais: [] },
  { id: 15, titulo: 'Soluções: Reciclagem', topico: 'Sustentabilidade', duracao: '03:30', nivel: 'Básico', humor: '♻️', descricao: 'Parta para a ação com foco em soluções. Descubra como a reciclagem e o descarte correto de resíduos sólidos são ferramentas poderosas para prevenir que o lixo chegue aos nossos rios e oceanos.', source: vid12, materiais: [] },
  { id: 16, titulo: 'Projeto Horta Escolar', topico: 'Prático', duracao: '04:10', nivel: 'Básico', humor: '🥕', descricao: 'Sustentabilidade na prática escolar. Veja como os alunos estão utilizando sistemas de captação e água de reuso para irrigar uma horta orgânica, fechando o ciclo de aprendizado ambiental.', source: vid13, materiais: [] },
  { id: 17, titulo: 'Entrevista com Biólogo', topico: 'Carreira', duracao: '08:00', nivel: 'Inspiracional', humor: '🎤', descricao: 'Inspiração profissional com um especialista. Um bate-papo esclarecedor sobre a carreira em biologia, os desafios da conservação ambiental e como os jovens podem ingressar nessa área vital.', source: vid14, materiais: [] },
  { id: 18, titulo: 'Feira de Ciências - Apresentação', topico: 'Eventos', duracao: '10:00', nivel: 'Geral', humor: '🏆', descricao: 'O grande dia de compartilhar conhecimento. Assista aos alunos apresentando suas descobertas e projetos inovadores sobre conservação da água para toda a comunidade escolar.', source: vid15, materiais: [] },
  { id: 19, titulo: 'Encerramento do Semestre', topico: 'Eventos', duracao: '02:00', nivel: 'Geral', humor: '🎉', descricao: 'Retrospectiva dos melhores momentos. Um vídeo comemorativo celebrando o aprendizado, as descobertas e o engajamento de todos nas atividades do projeto AquaLab neste semestre.', source: vid16, materiais: [] },
]

export default function StudentVideos() {
  const [idAtivo, setIdAtivo] = useState(listaVideos[0].id)

  const videoAtivo = useMemo(() => listaVideos.find((video) => video.id === idAtivo), [idAtivo])

  return (
    <LayoutAluno>
      <div className="videos-container">
        <div className="videos-box">
          <header className="videos-header">
            <div>
              <p className="eyebrow">Recursos em vídeo</p>
              <h1>Explorar os vídeos</h1>
              <p className="subtitle">Aprenda no seu próprio ritmo com nossa coleção completa.</p>
            </div>
          </header>

        <section className="player-layout">
          <div className="player-column">
            <div className="player-wrapper">
              <div className="player-frame">
                {videoAtivo && (
                  <video 
                    className="video-element" 
                    controls 
                    src={videoAtivo.source}
                    poster={videoAtivo.humor === '🌊' ? undefined : undefined} // Poderia ter poster
                    style={{ width: '100%', height: '100%', borderRadius: '12px', background: '#000' }}
                  >
                    Seu navegador não suporta a tag de vídeo.
                  </video>
                )}
              </div>
              <div className="player-meta">
                <div>
                  <p className="eyebrow">Você está assistindo</p>
                  <h2>{videoAtivo?.titulo}</h2>
                  <p className="meta">
                    {videoAtivo?.topico} • {videoAtivo?.duracao} • {videoAtivo?.nivel}
                  </p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h3>Descrição</h3>
              <p className="body-text">{videoAtivo?.descricao}</p>

              {videoAtivo?.materiais.length > 0 && (
                <>
                  <div className="materials-header">
                    <h4>Material</h4>
                    <span className="pill-soft">Baixar</span>
                  </div>
                  <div className="materials-list">
                    {videoAtivo?.materiais.map((item) => (
                      <a key={item.rotulo} href={item.url} className="material-link">
                        {item.rotulo}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="lesson-panel">
            <div className="lesson-header">
              <p className="eyebrow">Biblioteca</p>
              <span className="pill-soft">{listaVideos.length} Vídeos</span>
            </div>
            <div className="lesson-list">
              {listaVideos.map((video) => {
                const estahAtivo = video.id === idAtivo
                return (
                  <button
                    key={video.id}
                    type="button"
                    className={`lesson-item${estahAtivo ? ' active' : ''}`}
                    onClick={() => setIdAtivo(video.id)}
                  >
                    <span className="lesson-number">{video.id}</span>
                    <div className="lesson-copy">
                      <p className="lesson-title">{video.titulo}</p>
                      <p className="lesson-meta">{video.topico}</p>
                    </div>
                    {/* <span className="lesson-duration">{video.duracao}</span>  Opcional se ficar muito cheio */}
                  </button>
                )
              })}
            </div>
          </aside>
        </section>
      </div>
    </div>
    </LayoutAluno>
  )
}
