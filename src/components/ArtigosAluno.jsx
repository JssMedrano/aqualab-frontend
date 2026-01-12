import { useMemo, useState } from 'react'
import './ArtigosAluno.css'
import LayoutAluno from './LayoutAluno'

/*
 * Conteúdo dos artigos baseado nas referências fornecidas:
 * 1. Veolia (Reuso de água): https://golatam.veoliawatertechnologies.com/pt-br/reuso-de-agua
 * 2. Aquarela (Biodigestor): https://aquarela.eco.br/blog/
 */

const articles = [
  { 
    id: 1, 
    title: 'Reuso de Água', 
    date: '12/01/2026',
    category: 'Sustentabilidade',
    content: `
      <h3>O que é o Reuso de Água?</h3>
      <p>O reaproveitamento da água, ou reuso, é o processo de utilizar água que já foi usada para uma finalidade, tratá-la e utilizá-la novamente para outro fim. É uma prática essencial para a sustentabilidade, pois conserva os recursos de água potável e reduz o impacto ambiental.</p>

      <h3>Por que reutilizar?</h3>
      <p>A crise hídrica é uma realidade em muitas partes do mundo. O reuso ajuda a:</p>
      <ul>
        <li>Preservar mananciais de água potável para consumo humano.</li>
        <li>Garantir disponibilidade de água para indústrias e agricultura em tempos de seca.</li>
        <li>Reduzir a poluição lançada nos rios, pois a água é tratada antes do reuso.</li>
      </ul>

      <h3>Aplicações Práticas</h3>
      <p>A água de reuso geralmente não é potável (não serve para beber), mas é excelente para:</p>
      <ul>
        <li><strong>Irrigação:</strong> Regar jardins, praças e plantações.</li>
        <li><strong>Indústria:</strong> Em torres de resfriamento e lavagem de equipamentos.</li>
        <li><strong>Urbano:</strong> Lavagem de ruas, frotas de veículos e combate a incêndios.</li>
      </ul>

      <p>Adotar o reuso é um passo inteligente para um futuro onde a água limpa continue acessível a todos.</p>
    ` 
  },
  { 
    id: 2, 
    title: 'Entendendo o Biodigestor', 
    date: '10/01/2026',
    category: 'Tecnologia',
    content: `
      <h3>O que é um Biodigestor?</h3>
      <p>O biodigestor é uma câmara fechada (impermeável) onde materiais orgânicos, como restos de comida e fezes de animais, são colocados para sofrer decomposição anaeróbica (sem presença de ar). É como um "estômago" mecânico gigante.</p>

      <h3>Como funciona?</h3>
      <p>Dentro do biodigestor, bactérias consomem a matéria orgânica e liberam dois produtos valiosos:</p>
      <ol>
        <li><strong>Biogás:</strong> Uma mistura de gases (principalmente metano) que pode ser usada como combustível para cozinhar, gerar energia elétrica ou aquecer ambientes.</li>
        <li><strong>Biofertilizante:</strong> O resíduo líquido que sobra é rico em nutrientes e serve como um adubo natural potente e seguro para plantas, livre dos odores e patógenos do material original.</li>
      </ol>

      <h3>Vantagens</h3>
      <p>O uso de biodigestores transforma um problema (lixo orgânico) em solução (energia e adubo), fechando o ciclo da matéria de forma sustentável e eficiente.</p>
    `
  },
  { 
    id: 3, 
    title: 'Dicas Práticas para Economizar Água', 
    date: '05/01/2026',
    category: 'Dia a Dia',
    content: `
      <h3>Pequenas Ações, Grande Impacto</h3>
      <p>Economizar água não exige mudanças drásticas, apenas atenção aos detalhes:</p>
      <ul>
        <li>Feche a torneira ao escovar os dentes. Você salva até 12 litros por vez!</li>
        <li>Tome banhos rápidos. Um banho de 5 minutos é suficiente para a higiene.</li>
        <li>Use a vassoura, não a mangueira, para limpar calçadas e quintais.</li>
        <li>Verifique vazamentos: uma gota por segundo desperdiça 30 litros por dia.</li>
      </ul>
      <p>Seja um guardião da água em sua casa e escola!</p>
    `
  }
]

export default function ArtigosAluno() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState(articles[0].id)

  const selectedArticle = useMemo(() => articles.find(a => a.id === selectedId), [selectedId])

  const filteredArticles = useMemo(() => {
    return articles
      .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [searchTerm])

  return (
    <LayoutAluno>
      <div className="articles-main" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Header Compacto */}
        <header className="articles-toolbar" style={{ flexShrink: 0 }}>
          <div>
            <h1>Artigos Educativos</h1>
            <p className="toolbar-sub">Leitura complementar para seus estudos.</p>
          </div>
          <div className="search-box">
            <span role="img" aria-label="lupa">🔍</span>
            <input
              type="search"
              placeholder="Buscar artigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Layout de Duas Colunas: Lista e Leitura */}
        <section className="articles-content-split" style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '20px', padding: '0 2rem 2rem 2rem' }}>
          
          {/* Coluna da Lista */}
          <aside className="articles-list-column" style={{ width: '300px', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <div className="list-header" style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#f9f9f9', fontWeight: 'bold', color: '#666' }}>
               Biblioteca ({filteredArticles.length})
            </div>
            <div className="list-rows" style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  className={`slide-row ${selectedId === article.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(article.id)}
                  style={{ 
                    textAlign: 'left', 
                    padding: '15px', 
                    border: 'none', 
                    borderBottom: '1px solid #f0f0f0', 
                    background: selectedId === article.id ? '#f0f7ff' : 'white',
                    color: selectedId === article.id ? 'var(--cor-primaria)' : '#333', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="slide-name" style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>{article.title}</span>
                  <span className="slide-date" style={{ fontSize: '0.8rem', color: '#888' }}>{article.category} • {article.date}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Coluna de Leitura */}
          <article className="article-reader" style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowY: 'auto', border: '1px solid #eee', maxWidth: '800px' }}>
            {selectedArticle ? (
              <div className="article-body">
                <span className="article-badge" style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                  {selectedArticle.category}
                </span>
                <h1 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '2rem', color: '#1a1a1a' }}>{selectedArticle.title}</h1>
                <p style={{ color: '#666', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
                  Publicado em {selectedArticle.date}
                </p>
                
                <div 
                  className="article-text-content" 
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                  style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#333' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '100px', color: '#999' }}>
                Selecione um artigo para ler.
              </div>
            )}
          </article>

        </section>
      </div>
    </LayoutAluno>
  )
}
