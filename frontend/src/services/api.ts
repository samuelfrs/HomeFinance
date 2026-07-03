// Definição da URL base da API do backend .NET Core
const API_BASE_URL = 'http://localhost:5090/api';

// ==========================================
// TIPAGEM DE DADOS (TypeScript Interfaces)
// ==========================================

export type TipoTransacao = 'Despesa' | 'Receita';

export interface Pessoa {
  id: string;
  nome: string;
  idade: number;
}

export interface PessoaInput {
  nome: string;
  idade: number;
}

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  pessoaId: string;
  nomePessoa: string;
}

export interface TransacaoInput {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  pessoaId: string;
}

export interface PessoaTotal {
  id: string;
  nome: string;
  idade: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface TotalGeral {
  totalReceitasGeral: number;
  totalDespesasGeral: number;
  saldoLiquidoGeral: number;
}

export interface DashboardData {
  pessoasTotais: PessoaTotal[];
  totalGeral: TotalGeral;
}

// ==========================================
// FUNÇÕES DE INTEGRAÇÃO COM A API (Fetch)
// ==========================================

// Função auxiliar para tratar a resposta HTTP
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Tenta obter a mensagem de erro em formato de texto ou JSON retornada pelo backend
    const errorText = await response.text();
    let errorMessage = 'Ocorreu um erro ao processar a requisição.';
    
    try {
      // Se for um JSON com estrutura de erro, tenta extrair
      const parsedError = JSON.parse(errorText);
      errorMessage = parsedError.mensagem || parsedError.message || errorText;
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
  }

  // Retorna vazio caso o status seja 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// Serviços relacionados a Pessoas
export const pessoasService = {
  // Listar todas as pessoas
  getAll: async (): Promise<Pessoa[]> => {
    const response = await fetch(`${API_BASE_URL}/pessoas`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/type' },
      cache: 'no-store', // Desativa cache para garantir dados em tempo real
    });
    return handleResponse<Pessoa[]>(response);
  },

  // Obter pessoa por ID
  getById: async (id: string): Promise<Pessoa> => {
    const response = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });
    return handleResponse<Pessoa>(response);
  },

  // Criar nova pessoa
  create: async (data: PessoaInput): Promise<Pessoa> => {
    const response = await fetch(`${API_BASE_URL}/pessoas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Pessoa>(response);
  },

  // Editar pessoa existente
  update: async (id: string, data: PessoaInput): Promise<Pessoa> => {
    const response = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Pessoa>(response);
  },

  // Deletar pessoa e suas transações vinculadas por cascata
  delete: async (id: string): Promise<{ mensagem: string }> => {
    const response = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ mensagem: string }>(response);
  },
};

// Serviços relacionados a Transações
export const transacoesService = {
  // Listar todas as transações
  getAll: async (): Promise<Transacao[]> => {
    const response = await fetch(`${API_BASE_URL}/transacoes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    return handleResponse<Transacao[]>(response);
  },

  // Criar nova transação com validação de idade
  create: async (data: TransacaoInput): Promise<Transacao> => {
    const response = await fetch(`${API_BASE_URL}/transacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Transacao>(response);
  },
};

// Serviços relacionados ao Dashboard consolidado
export const dashboardService = {
  // Obter saldo individual e total consolidado
  getSummary: async (): Promise<DashboardData> => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    return handleResponse<DashboardData>(response);
  },
};
