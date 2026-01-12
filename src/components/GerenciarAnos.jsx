import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './EstilosComuns.css';
import './GerenciarAnos.css';

export default function GerenciarAnos() {
  const { userType, token, getYears, createYear, updateYear, deleteYear } = useAuth();
  const navigate = useNavigate();

  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newYear, setNewYear] = useState('');
  const [saving, setSaving] = useState(false);

  const canManage = token && userType === 'teacher';

  const load = async () => {
    setLoading(true);
    setError('');

    if (!canManage) {
      setError('Somente professores podem administrar anos.');
      setLoading(false);
      return;
    }

    const result = await getYears();
    if (result.success) {
      setYears(result.data || []);
    } else {
      setError(result.error || 'Erro ao carregar anos');
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseInt(newYear, 10);
    if (!parsed || parsed < 1) {
      setError('Insira um ano válido (>= 1).');
      return;
    }

    setSaving(true);
    const result = await createYear(parsed);
    if (result.success) {
      setNewYear('');
      await load();
    } else {
      setError(result.error || 'Não foi possível criar o ano');
    }
    setSaving(false);
  };

  const handleEdit = async (yearObj) => {
    const currentValue = yearObj?.year ?? yearObj?.value;
    const input = window.prompt('Novo valor para o ano:', String(currentValue ?? ''));
    if (input == null) return;

    const parsed = parseInt(input, 10);
    if (!parsed || parsed < 1) {
      alert('⚠️ Ano inválido');
      return;
    }

    const result = await updateYear(yearObj.id, parsed);
    if (result.success) {
      await load();
    } else {
      alert('❌ ' + (result.error || 'Não foi possível atualizar'));
    }
  };

  const handleDelete = async (yearObj) => {
    if (!window.confirm(`Deseja excluir o ano ${yearObj?.year ?? ''}?`)) return;
    const result = await deleteYear(yearObj.id);
    if (result.success) {
      setYears(prev => prev.filter(y => y.id !== yearObj.id));
    } else {
      alert('❌ ' + (result.error || 'Não foi possível excluir'));
    }
  };

  if (loading) {
    return (
      <div className="manage-years-container">
        <div className="manage-years-box">
          <div className="loading">Carregando anos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-years-container">
      <div className="manage-years-box">
        <div className="header">
          <div>
            <h1>🗓️ Gerenciar Turmas (Professor)</h1>
            <p className="subtitle">Criar/Editar/Excluir</p>
          </div>
          <div className="actions">
            <button className="btn-back" onClick={() => navigate('/painel-professor')}>
              ← Voltar
            </button>
          </div>
        </div>

        {error && <div className="error">❌ {error}</div>}

        <form className="create-form" onSubmit={handleCreate}>
          <input
            type="number"
            min="1"
            placeholder="Ex: 1, 2, 3..."
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            disabled={!canManage || saving}
          />
          <button type="submit" className="btn-create" disabled={!canManage || saving}>
            {saving ? 'Criando...' : 'Criar Ano'}
          </button>
        </form>

        {years.length === 0 ? (
            <div className="empty">Não há anos criados.</div>
        ) : (
          <div className="list">
            {years.map((y) => (
              <div key={y.id} className="row">
                <div className="year">Ano: <strong>{y.year ?? y.value ?? ''}</strong></div>
                <div className="row-actions">
                  <button className="btn-edit" onClick={() => handleEdit(y)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(y)}>
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
