import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Função para decodificar JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro decodificando JWT:', error);
    return null;
  }
};

// Configuração da API: em dev usa o proxy /api, em prod usa VITE_API_URL do Vercel
const API_URL = import.meta.env.VITE_API_URL 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredTokenSafe = () => {
  try {
    return globalThis?.localStorage?.getItem('token') || null;
  } catch {
    return null;
  }
};

// Ensure Authorization is present even if a component fires a request
// before AuthProvider finishes hydrating state from localStorage.
apiClient.interceptors.request.use(
  (config) => {
    const storedToken = getStoredTokenSafe();
    if (storedToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'student' or 'teacher'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserIdFromToken = (tokenOverride) => {
    const decoded = decodeJWT(tokenOverride || token || getStoredTokenSafe());
    return decoded?.sub || decoded?.id || null;
  };

  // Obter resultados de um aluno (vista professor)
  const getTeacherStudentResults = async (studentId) => {
    // setLoading(true); // Removido para evitar refresh loop
    setError(null);
    try {
      console.log('👩‍🏫 Obtendo resultados para estudante:', studentId);
      console.log('🔐 Token atual:', token ? token.substring(0, 20) + '...' : 'SEM TOKEN');
      console.log('🔐 Headers:', apiClient.defaults.headers.common);
      
      const response = await apiClient.get(`/students/${studentId}/results`);
      console.log('✅ Resposta do backend:', response.data);
      
      // Backend retorna { attempts: [...], stats: {...} } diretamente
      const attempts = response.data?.attempts || [];
      const stats = response.data?.stats || { averageScore: 0, totalAttempts: 0, passedQuizzes: 0 };
      
      console.log('✅ Tentativas extraídas:', attempts.length);
      console.log('✅ Estatísticas:', stats);
      
      // setLoading(false);
      return { 
        success: true, 
        data: { 
          attempts, 
          stats 
        } 
      };
    } catch (err) {
      console.error('❌ Erro em getTeacherStudentResults:', err.response?.status, err.response?.data);
      console.error('❌ URL solicitada:', err.config?.url);
      console.error('❌ Headers enviados:', err.config?.headers);
      const errorMsg = err.response?.data?.message || 'Erro ao obter resultados do estudante';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const sanitizeUserForStorage = (u) => {
    if (!u || typeof u !== 'object') return u;
    // eslint-disable-next-line no-unused-vars
    const { password, ...rest } = u;
    return rest;
  };

  const setAndPersistUser = (u) => {
    const safe = sanitizeUserForStorage(u);
    setUser(safe);
    if (safe) {
      localStorage.setItem('user', JSON.stringify(safe));
    }
  };

  // Recuperar token do localStorage ao carregar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserType = localStorage.getItem('userType');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUserType) {
      setToken(savedToken);
      setUserType(savedUserType);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
      
      // Decodificar JWT para ver qual ano está armazenado
      const decoded = decodeJWT(savedToken);
      console.log('✅ Token carregado do localStorage');
      console.log('Token:', savedToken.substring(0, 20) + '...');
      console.log('UserType:', savedUserType);
      console.log('🔐 Payload do JWT decodificado:', decoded);
      console.log('Ano no token:', decoded?.year);
      
      // Injetar token nos headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      console.log('Headers após setar:', apiClient.defaults.headers.common);

      // Auto-atualizar o perfil do professor para trazer `year` o mais rápido possível.
      // Isso evita que a UI fique com `year` undefined após recarregar a página.
      if (savedUserType === 'teacher') {
        const teacherId = decoded?.sub || decoded?.id;
        if (teacherId) {
          (async () => {
            try {
              const teacherResponse = await apiClient.get(`/teachers/${teacherId}`);
              setAndPersistUser(teacherResponse.data);
              console.log('✅ Perfil do professor atualizado ao iniciar:', teacherResponse.data);
            } catch (err) {
              console.warn('⚠️ Não foi possível atualizar o perfil do professor ao iniciar:', err.response?.status, err.response?.data);
            }
          })();
        }
      }
    }
  }, []);

  const refreshCurrentTeacherProfile = async () => {
    const teacherId = user?.id || getUserIdFromToken();
    if (!teacherId) return { success: false, error: 'Não foi possível determinar o ID do professor' };

    try {
      const response = await apiClient.get(`/teachers/${teacherId}`);
      setAndPersistUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar perfil do professor';
      return { success: false, error: errorMessage };
    }
  };

  const refreshCurrentStudentProfile = async () => {
    const studentId = user?.id || getUserIdFromToken();
    if (!studentId) return { success: false, error: 'Não foi possível determinar o ID do aluno' };

    try {
      const response = await apiClient.get(`/students/${studentId}`);
      setAndPersistUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar perfil do aluno';
      return { success: false, error: errorMessage };
    }
  };

  const setMyTeacherYear = async (yearValue) => {
    const teacherId = user?.id || getUserIdFromToken();
    if (!teacherId) return { success: false, error: 'Não foi possível determinar o ID do professor' };
    const parsedYear = typeof yearValue === 'string' ? parseInt(yearValue, 10) : yearValue;
    if (!parsedYear || parsedYear < 1) return { success: false, error: 'Ano inválido' };

    const result = await updateTeacher(teacherId, { year: parsedYear });
    if (!result.success) return result;
    return refreshCurrentTeacherProfile();
  };

  // Login de alunos
  const loginStudent = async (enrollmentNumber) => {
    setLoading(true);
    setError(null);

    try {
      // Limpar sessão anterior completamente
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setUserType(null);
      setToken(null);

      const response = await apiClient.post('/auth/student/login', {
        enrollmentNumber,
      });

      const { token: newToken } = response.data;

      setToken(newToken);
      setUserType('student');
      // Configurar header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Obter dados completos do aluno para contar com `year`
      const decoded = decodeJWT(newToken);
      const studentId = decoded?.sub || decoded?.id;
      let studentData = { enrollmentNumber };
      if (studentId) {
        try {
          const studentResponse = await apiClient.get(`/students/${studentId}`);
          studentData = sanitizeUserForStorage(studentResponse.data);
        } catch (err) {
          console.warn('⚠️ Não foi possível obter o perfil do aluno:', err.response?.status, err.response?.data);
        }
      }
      setAndPersistUser(studentData);

      // Salvar no localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', 'student');
      localStorage.setItem('user', JSON.stringify(studentData));

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro no login de alunos';
      setError(errorMessage);
      console.error('Erro de login (aluno):', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login de professores
  const loginTeacher = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Limpar sessão anterior completamente
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setUserType(null);
      setToken(null);

      const response = await apiClient.post('/auth/teacher/login', {
        email,
        password,
      });

      const { token: newToken } = response.data;

      // Decodificar JWT para ver quais dados contém
      const decoded = decodeJWT(newToken);
      console.log('🔐 Payload do JWT decodificado:', decoded);
      console.log('Função no token:', decoded?.role);
      console.log('ID do professor no token (sub):', decoded?.sub);

      setToken(newToken);
      setUserType('teacher');

      // Configurar header o mais rápido possível
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Agora obter os dados completos do professor usando seu ID
      console.log('📥 Obtendo dados completos do professor...');
      const teacherResponse = await apiClient.get(`/teachers/${decoded?.sub}`);
      const teacherData = sanitizeUserForStorage(teacherResponse.data);
      
      console.log('✅ Dados do professor obtidos:', teacherData);
      console.log('Ano atribuído ao professor:', teacherData?.year);
      
      setAndPersistUser(teacherData);

      // Salvar no localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', 'teacher');
      localStorage.setItem('user', JSON.stringify(teacherData));

      console.log('🎓 Login de professor com sucesso');
      console.log('Email:', teacherData?.email);
      console.log('Ano do professor:', teacherData?.year);

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro no login de professores';
      setError(errorMessage);
      console.error('Erro de login (professor):', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Registrar aluno
  const registerStudent = async (name, enrollmentNumber, year) => {
    // setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/students', {
        name,
        enrollmentNumber,
        year,
      });

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro no cadastro de aluno';
      setError(errorMessage);
      console.error('Erro de registro (aluno):', err);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Registrar professor
  const registerTeacher = async (name, enrollmentNumber, email, password) => {
    // setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/teachers', {
        name,
        enrollmentNumber,
        email,
        password,
      });

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro no cadastro de professor';
      setError(errorMessage);
      console.error('Erro de registro (professor):', err);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Obter todos os alunos
  const getStudents = async () => {
    // setLoading(true);
    setError(null);

    try {
      console.log('📚 Obtendo lista de alunos...');
      const response = await apiClient.get('/students');
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data?.students || response.data?.data || []);
      console.log('✅ Alunos obtidos:', data);
      console.log('Quantidade de alunos:', data?.length || 0);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Erro ao obter alunos:', err.response?.status, err.response?.data);
      const errorMessage = err.response?.data?.error || 'Erro ao obter alunos';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Obter aluno por ID
  const getStudentById = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/students/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao obter aluno';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Obter professor por ID
  const getTeacherById = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/teachers/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao obter professor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Atualizar aluno
  const updateStudent = async (id, data) => {
    // setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/students/${id}`, data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar aluno';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Atualizar professor
  const updateTeacher = async (id, data) => {
    // setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/teachers/${id}`, data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar professor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Excluir aluno
  const deleteStudent = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/students/${id}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao excluir aluno';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Excluir professor
  const deleteTeacher = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/teachers/${id}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao excluir professor';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setUserType(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // ========== QUIZ METHODS ==========

  // Criar quiz (apenas professores)
  const createQuiz = async (quizData) => {
    // setLoading(true);
    setError(null);

    console.log('=== CRIANDO QUIZ ===');
    console.log('Token do estado:', token ? token.substring(0, 30) + '...' : 'NULO');
    console.log('UserType do estado:', userType);
    console.log('Dados a enviar:', JSON.stringify(quizData, null, 2));
    console.log('Tipo de year:', typeof quizData.year, 'Valor:', quizData.year);
    
    // Decodificar JWT para ver qual ano tem
    const decoded = decodeJWT(token);
    console.log('🔐 Payload JWT decodificado:', decoded);
    console.log('Ano no token (JWT):', decoded?.year);
    console.log('ID do Professor no token:', decoded?.id || decoded?.sub);
    console.log('Email no token:', decoded?.email);
    
    const authHeader = apiClient.defaults.headers.common['Authorization'];
    console.log('Header Authorization:', authHeader ? authHeader.substring(0, 30) + '...' : 'NÃO CONFIGURADO');
    console.log('Todos os headers:', apiClient.defaults.headers.common);

    try {
      console.log('Enviando POST para /quizzes...');
      const response = await apiClient.post('/quizzes', quizData);
      console.log('✅ Resposta bem-sucedida:', response.data);
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('=== ERRO AO CRIAR QUIZ ===');
      console.error('Status:', err.response?.status);
      console.error('StatusText:', err.response?.statusText);
      try {
        console.error('Data (JSON):', JSON.stringify(err.response?.data));
      } catch {
        console.error('Data:', err.response?.data);
      }
      console.error('Headers enviados:', err.config?.headers);
      console.error('URL:', err.config?.url);
      console.error('Payload enviado:', err.config?.data);
      console.error('Erro completo:', err);

      let errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao criar quiz';
      
      if (err.response?.status === 400) {
        errorMsg = `Erro 400: ${err.response?.data?.message || err.response?.data?.error || 'Dados inválidos'}. Verifique o console para mais detalhes. (Sugestão: verifique se o backend requer yearId além de year)`;
      } else if (err.response?.status === 404) {
        errorMsg = 'Endpoint POST /api/quizzes não implementado no servidor (porta 3333)';
      } else if (err.response?.status === 401) {
        errorMsg = `Erro 401 Não Autorizado: O token não é válido. Token: ${token ? 'SIM' : 'NÃO'} | Header enviado: ${authHeader ? 'SIM' : 'NÃO'}`;
      } else if (err.response?.status === 403) {
        errorMsg = `Erro 403 Proibido: Você não tem permissões de professor. UserType: ${userType}`;
      } else if (!err.response) {
        errorMsg = 'Não foi possível conectar com o servidor na porta 3333';
      }
      
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg, details: err.response?.data };
    }
  };

  // Obter todos os quizzes
  const getQuizzes = async () => {
    // setLoading(true);
    setError(null);

    try {
      console.log('📖 Obtendo lista de quizzes...');
      const response = await apiClient.get('/quizzes');
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data?.quizzes || response.data?.data || []);
      console.log('✅ Quizzes obtidos:', data);
      console.log('Quantidade de quizzes:', data?.length || 0);
      // setLoading(false);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Erro ao obter quizzes:', err.response?.status, err.response?.data);
      let errorMsg = err.response?.data?.message || 'Erro ao obter quizzes';
      if (err.response?.status === 404) {
        errorMsg = 'Endpoint /api/quizzes não implementado no servidor';
      } else if (!err.response) {
        errorMsg = 'Não foi possível conectar com o servidor na porta 3333';
      }
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Obter quizzes por professor (apenas professores)
  const getTeacherQuizzes = async (teacherId) => {
    // setLoading(true);
    setError(null);

    const effectiveTeacherId = teacherId || user?.id || getUserIdFromToken();
    if (!effectiveTeacherId) {
      // setLoading(false);
      return { success: false, error: 'Não foi possível determinar o ID do professor' };
    }

    try {
      console.log('📚 Obtendo quizzes do professor:', effectiveTeacherId);
      const response = await apiClient.get(`/quizzes/teacher/${effectiveTeacherId}`);
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data?.quizzes || response.data?.data || []);
      // setLoading(false);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Erro ao obter quizzes do professor:', err.response?.status, err.response?.data);
      let errorMsg = err.response?.data?.message || 'Erro ao obter quizzes do professor';
      if (err.response?.status === 403) {
        errorMsg = 'Acesso negado: apenas professores';
      }
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // ========== YEARS (ANOS ESCOLARES) ==========

  const getYears = async () => {
    // setLoading(true);
    setError(null);

    try {
      console.log('🗓️ Obtendo anos...');
      const response = await apiClient.get('/years');
      
      let data = Array.isArray(response.data)
        ? response.data
        : (response.data?.years || response.data?.data || []);

      // Log detalhado de cada ano
      console.log(`📋 Total de anos retornados: ${data.length}`);
      data.forEach((y, i) => {
        console.log(`   [${i}]`, y);
      });

      // setLoading(false);
      return { success: true, data };
    } catch (err) {
      // Apenas logar erro se não for 401/403 (esperado em páginas públicas)
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('❌ Erro ao obter anos:', err.response?.status, err.response?.data);
      }
      let errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao obter anos';
      if (err.response?.status === 403) {
        errorMsg = 'Acesso negado: apenas professores';
      } else if (err.response?.status === 401) {
        errorMsg = 'Token inválido ou expirado';
      }
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Versão pública sem autenticação para páginas de cadastro
  const getYearsPublic = async () => {
    try {
      // Criar uma instância de axios sem o interceptor de autenticação
      const publicClient = axios.create({
        baseURL: API_URL,
        timeout: 5000,
      });
      
      const response = await publicClient.get('/years');
      
      let data = Array.isArray(response.data)
        ? response.data
        : (response.data?.years || response.data?.data || []);

      return { success: true, data };
    } catch {
      // Falha silenciosa para páginas públicas (endpoint requer autenticação)
      return { success: false, error: 'Endpoint requer autenticação', data: [] };
    }
  };

  const createYear = async (yearValue) => {
    // setLoading(true);
    setError(null);

    try {
      const payload = typeof yearValue === 'number' ? { year: yearValue } : yearValue;
      console.log('🗓️ Criando ano:', payload);
      const response = await apiClient.post('/years', payload);
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erro ao criar ano:', err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao criar ano';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const updateYear = async (id, yearValue) => {
    // setLoading(true);
    setError(null);

    try {
      const payload = typeof yearValue === 'number' ? { year: yearValue } : yearValue;
      const response = await apiClient.put(`/years/${id}`, payload);
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erro ao atualizar ano:', err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar ano';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const deleteYear = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/years/${id}`);
      // setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('❌ Erro ao excluir ano:', err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao excluir ano';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Obter quiz por ID
  const getQuizById = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('📖 Frontend: Obtendo quiz:', id);
      console.log('👤 Tipo de usuário:', userType);
      
      // Se é professor, usar GET direto para obter quiz com todas as respostas
      if (userType === 'teacher') {
        console.log('👨‍🏫 Usando GET /quizzes/:id para professor');
        const response = await apiClient.get(`/quizzes/${id}`);
        console.log('✅ Quiz obtido:', response.data);
        // setLoading(false);
        return { success: true, data: response.data };
      }
      
      // Se é estudante, usar POST /start
      console.log('👨‍🎓 Usando POST /quizzes/:id/start para estudante');
      const response = await apiClient.post(`/quizzes/${id}/start`, {});
      console.log('✅ Quiz iniciado:', response.data);
      // setLoading(false);
      return { success: true, data: response.data };
      
    } catch (err) {
      console.error('❌ Erro ao obter quiz - Status:', err.response?.status);
      console.error('❌ Error data:', err.response?.data);
      console.error('❌ Error completo:', err);
      
      const errorMsg = err.response?.data?.message || 'Erro ao obter quiz';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      // setLoading(false);
    }
  };

  // Atualizar quiz
  const updateQuiz = async (id, quizData) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('🔄 Atualizando quiz:', id);
      console.log('📋 Payload completo:', JSON.stringify(quizData, null, 2));
      
      // Mostrar estrutura do payload
      console.log('  - title:', quizData.title);
      console.log('  - description:', quizData.description);
      console.log('  - questions length:', quizData.questions?.length);
      if (quizData.questions?.length > 0) {
        console.log('  - Primeira pergunta completa:', JSON.stringify(quizData.questions[0], null, 2));
        console.log('  - quizId na primeira pergunta:', quizData.questions[0].quizId);
      }
      
      const response = await apiClient.put(`/quizzes/${id}`, quizData);
      
      console.log('✅ Quiz atualizado com sucesso');
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erro ao atualizar quiz:');
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar quiz';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Excluir quiz
  const deleteQuiz = async (id) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Frontend: Excluindo quiz:', id);
      console.log('🔑 Token presente:', !!localStorage.getItem('token'));
      
      const response = await apiClient.delete(`/quizzes/${id}`);
      
      console.log('✅ Quiz excluído com sucesso:', response.data);
      // setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('❌ Erro ao excluir quiz - Status:', err.response?.status);
      console.error('❌ Dados do erro:', err.response?.data);
      console.error('❌ Erro completo:', err);
      
      const errorMsg = err.response?.data?.message || 'Erro ao excluir quiz';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  // ========== TENTATIVAS DE QUIZ (ALUNOS) ==========

  // Iniciar tentativa de quiz (estudante)
  const startQuizAttempt = async (quizId) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando tentativa de quiz:', quizId);
      const response = await apiClient.post(`/quizzes/${quizId}/start`);
      console.log('✅ Resposta completa de POST /start:', response.data);
      console.log('✅ response.data.data:', response.data?.data);
      
      // O backend retorna: { success: true, data: { id: attemptId, ...outrasPerguntas } }
      // Ou poderia retornar: { id: attemptId, ...otrasPreguntas }
      const returnData = response.data?.data || response.data;
      
      // setLoading(false);
      return { 
        success: true, 
        data: returnData  // Retornamos apenas a parte data, não o objeto completo response.data
      };
    } catch (err) {
      console.error('❌ Erro ao iniciar tentativa:', err.response?.status, err.response?.data);
      let errorMsg = err.response?.data?.message || 'Erro ao iniciar tentativa de quiz';
      if (err.response?.status === 403) {
        errorMsg = 'Sem permissão para realizar o quiz';
      } else if (err.response?.status === 404) {
        errorMsg = 'Quiz não encontrado';
      }
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Enviar respostas do quiz (estudante)
  const submitQuizAttempt = async (attemptId, answers, quizData = null) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('📤 submitQuizAttempt iniciado');
      console.log('🆔 attemptId:', attemptId);
      console.log('📋 respostas recebidas:', answers);
      console.log('📚 quizData recebida:', quizData);
      console.log('🔍 Tipo de respostas:', Array.isArray(answers) ? 'array' : typeof answers);
      
      if (!attemptId) {
        throw new Error('attemptId não está definido');
      }
      
      if (!Array.isArray(answers)) {
        throw new Error('answers deve ser um array');
      }
      
      // Verificando estrutura de respostas
      console.log('🔍 Verificando estrutura de respostas:');
      answers.forEach((ans, idx) => {
        if (typeof ans === 'object' && ans !== null) {
          console.log(`  [${idx}]: questionId=${ans.questionId}, optionId=${ans.optionId}`);
        } else {
          console.log(`  [${idx}]: ${ans} (tipo primitivo)`);
        }
      });
      
      // Backend persistente: POST /quiz-attempts com attemptId, quizId e respostas
      const payload = { attemptId, quizId: quizData?.id, answers };
      
      console.log('📋 Payload final a enviar:', JSON.stringify(payload, null, 2));
      console.log('🌐 Endpoint:', `/quiz-attempts`);
      console.log('🔐 Token incluido:', !!getStoredTokenSafe());
      
      const response = await apiClient.post(`/quiz-attempts`, payload);
      console.log('✅ Resposta recebida:', response.status);
      console.log('✅ Respostas enviadas com sucesso:', response.data);
      
      // Salvar resultado no localStorage para histórico de quizzes completados
      if (response.data) {
        try {
          // Obter o ID do estudante atual
          const studentId = user?.id || 'unknown';
          
          // Usar chaves específicas por estudante para evitar compartilhar dados entre alunos
          const completedQuizzesKey = `completedQuizzes_${studentId}`;
          const completedQuizIdsKey = `completedQuizIds_${studentId}`;
          
          const completedAttempts = JSON.parse(localStorage.getItem(completedQuizzesKey) || '[]');
          
          // Criar objeto com dados do resultado
          const attemptResult = {
            id: attemptId,
            ...response.data,
            // Adicionar informação do quiz se disponível
            quizTitle: quizData?.title || response.data.quizTitle || 'Quiz',
            totalQuestions: quizData?.questions?.length || response.data.totalQuestions || 0,
            quizId: quizData?.id || response.data.quizId,
            studentId: studentId,  // Salvar também o ID do estudante
            submittedAt: new Date().toISOString(),
            status: 'completed',
            // Calcular corretas e incorretas dos resultados se existirem
            correctAnswers: response.data.results 
              ? response.data.results.filter(r => r.isCorrect).length 
              : null,
            incorrectAnswers: response.data.results 
              ? response.data.results.filter(r => !r.isCorrect).length 
              : null
          };
          
          // Adicionar à lista (no início para que os mais recentes apareçam primeiro)
          completedAttempts.unshift(attemptResult);
          
          // Salvar no localStorage com chave específica do estudante
          localStorage.setItem(completedQuizzesKey, JSON.stringify(completedAttempts));
          
          // Salvar também uma lista de IDs de quizzes completados para filtragem rápida
          // IMPORTANTE: Esta lista é individual por aluno (localStorage + studentId)
          // Se o Aluno A completa o Quiz 1, oculta apenas para ele
          // O Aluno B continuará vendo o Quiz 1 até que o complete
          const completedQuizIds = JSON.parse(localStorage.getItem(completedQuizIdsKey) || '[]');
          const quizId = quizData?.id || response.data.quizId;
          if (quizId && !completedQuizIds.includes(quizId)) {
            completedQuizIds.push(quizId);
            localStorage.setItem(completedQuizIdsKey, JSON.stringify(completedQuizIds));
            console.log('💾 Quiz ID adicionado aos completados para o estudante', studentId, ':', quizId);
            console.log('💾 Este aluno completou', completedQuizIds.length, 'quizzes');
          }
          
          console.log('💾 Resultado salvo no localStorage para estudante', studentId, ':', attemptResult);
          console.log('💾 Total de quizzes completados por este estudante:', completedAttempts.length);
        } catch (storageErr) {
          console.warn('⚠️ Não foi possível salvar no localStorage', storageErr);
        }
      }
      
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erro em submitQuizAttempt - Status:', err.response?.status);
      console.error('❌ Erro em submitQuizAttempt - Data:', err.response?.data);
      console.error('❌ Erro em submitQuizAttempt - Message:', err.message);
      
      let errorMsg = 'Erro ao enviar respostas';
      
      if (err.message) {
        errorMsg = err.message;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      
      if (err.response?.status === 400) {
        errorMsg = `Erro de validação (400): ${errorMsg}`;
      } else if (err.response?.status === 403) {
        errorMsg = 'Você não tem permissão para esta tentativa (403)';
      } else if (err.response?.status === 404) {
        errorMsg = 'Tentativa de quiz não encontrada (404)';
      } else if (err.response?.status === 500) {
        errorMsg = 'Erro no servidor (500)';
      } else if (!err.response) {
        errorMsg = 'Erro de conexão: ' + err.message;
      }
      
      console.error('📌 Mensagem de erro final:', errorMsg);
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Obter tentativa de quiz por ID (ver progresso/resultados)
  const getQuizAttempt = async (attemptId) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('📋 Obtendo tentativa de quiz:', attemptId);
      const response = await apiClient.get(`/quiz-attempts/${attemptId}`);
      console.log('✅ Tentativa obtida:', response.data);
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erro ao obter tentativa:', err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || 'Erro ao obter tentativa';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Excluir tentativa de quiz (estudante)
  const deleteQuizAttempt = async (attemptId) => {
    // setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Excluindo tentativa de quiz:', attemptId);
      const response = await apiClient.delete(`/quiz-attempts/${attemptId}`);
      console.log('✅ Tentativa excluída:', response.data);
      // setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erro ao excluir tentativa:', err.response?.status, err.response?.data);
      const errorMsg = err.response?.data?.message || 'Erro ao excluir tentativa';
      setError(errorMsg);
      // setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Obter tentativas completadas do estudante atual (do localStorage com ID específico)
  const getStudentCompletedAttempts = async () => {
    // setLoading(true);
    setError(null);

    try {
      const studentId = user?.id || 'unknown';
      const completedQuizzesKey = `completedQuizzes_${studentId}`;
      
      console.log('📊 Obtendo tentativas completadas para estudante:', studentId);
      console.log('📊 Chave de localStorage:', completedQuizzesKey);
      
      // Tentar obter da API primeiro
      try {
        console.log('📊 Tentando GET /quiz-attempts...');
        console.log('🔐 Token:', token ? token.substring(0, 20) + '...' : 'SEM TOKEN');
        console.log('🔐 Tipo de usuário:', userType);
        console.log('🔐 ID do usuário:', user?.id);
        
        const response = await apiClient.get('/quiz-attempts');
        console.log('📊 Resposta de quiz-attempts:', response.data);
        
        // Backend retorna { success: true, data: [...] }
        let attempts = [];
        if (response.data?.success && Array.isArray(response.data?.data)) {
          attempts = response.data.data;
        } else if (Array.isArray(response.data)) {
          attempts = response.data;
        }
        
        // Filtrar apenas os completados/enviados
        const completedAttempts = attempts.filter(attempt =>
          attempt.status === 'completed' ||
          attempt.status === 'submitted' ||
          attempt.score !== null
        );
        
        console.log('✅ Tentativas completadas filtradas (API):', completedAttempts.length, 'tentativas');
        // setLoading(false);
        return { success: true, data: completedAttempts };
      } catch (apiErr) {
        // Si el API falla, usar localStorage como fallback
        console.error('❌ Error en GET /quiz-attempts:', apiErr.response?.status, apiErr.response?.data);
        console.error('❌ URL:', apiErr.config?.url);
        console.error('❌ Headers enviados:', apiErr.config?.headers);
        
        if (apiErr.response?.status === 404) {
          console.warn('⚠️ Endpoint /quiz-attempts no disponible, usando localStorage');
        } else if (apiErr.response?.status === 403) {
          console.warn('⚠️ Error 403 Forbidden - Sin permisos para /quiz-attempts');
        } else {
          console.warn('⚠️ Error en API, usando localStorage:', apiErr.message);
        }
        
        // Obtener desde localStorage con clave específica del estudiante
        const storedAttempts = JSON.parse(localStorage.getItem(completedQuizzesKey) || '[]');
        console.log('📊 Intentos completados desde localStorage para', studentId, ':', storedAttempts);
        
        // setLoading(false);
        return { success: true, data: storedAttempts };
      }
    } catch (err) {
      console.error('❌ Erro ao obter tentativas completadas:', err);
      
      // Último recurso: retornar array vazio
      // setLoading(false);
      return { success: true, data: [] };
    }
  };

  const value = {
    // Estado
    user,
    token,
    userType,
    loading,
    error,
    isAuthenticated: !!token,

    // Métodos
    loginStudent,
    loginTeacher,
    registerStudent,
    registerTeacher,
    getStudents,
    getStudentById,
    getTeacherById,
    updateStudent,
    updateTeacher,
    deleteStudent,
    deleteTeacher,
    createQuiz,
    getQuizzes,
    getTeacherQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getYears,
    getYearsPublic,
    createYear,
    updateYear,
    deleteYear,
    refreshCurrentTeacherProfile,
    refreshCurrentStudentProfile,
    setMyTeacherYear,
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttempt,
    deleteQuizAttempt,
    getStudentCompletedAttempts,
    getTeacherStudentResults,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
