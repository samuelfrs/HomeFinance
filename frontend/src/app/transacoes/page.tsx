'use client';

import { useEffect, useState } from 'react';
import { transacoesService, pessoasService, Transacao, Pessoa, TipoTransacao } from '@/services/api';

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TipoTransacao>('Despesa');
  const [pessoaId, setPessoaId] = useState('');

  // Estados de Validação e Feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado para guardar a pessoa selecionada atualmente e sua idade
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);

  // Carrega os dados iniciais (Pessoas e Transações)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pessoasData, transacoesData] = await Promise.all([
        pessoasService.getAll(),
        transacoesService.getAll()
      ]);

      setPessoas(pessoasData);
      setTransacoes(transacoesData);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar os dados. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Monitora a seleção de pessoa para aplicar a validação visual inteligente de idade
  useEffect(() => {
    if (pessoaId) {
      const pessoa = pessoas.find(p => p.id === pessoaId);
      setSelectedPessoa(pessoa || null);
      
      // Se a pessoa for menor de idade e estiver selecionado "Receita", ajusta para "Despesa" ou avisa
      if (pessoa && pessoa.idade < 18 && tipo === 'Receita') {
        setTipo('Despesa');
        setFormError(`Regra de Idade: ${pessoa.nome} é menor de idade (${pessoa.idade} anos), logo só pode registrar despesas.`);
      } else {
        setFormError(null);
      }
    } else {
      setSelectedPessoa(null);
      setFormError(null);
    }
  }, [pessoaId, pessoas]);

  // Monitora a alteração do Tipo para validação de idade em tempo real
  const handleTipoChange = (novoTipo: TipoTransacao) => {
    setTipo(novoTipo);
    if (selectedPessoa && selectedPessoa.idade < 18 && novoTipo === 'Receita') {
      setFormError(`Não é permitido cadastrar receitas para menores de 18 anos. ${selectedPessoa.nome} possui ${selectedPessoa.idade} anos.`);
    } else {
      setFormError(null);
    }
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validações básicas no frontend
    if (!descricao.trim()) {
      setFormError('A descrição da transação é obrigatória.');
      return;
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setFormError('O valor deve ser um número maior que zero.');
      return;
    }

    if (!pessoaId) {
      setFormError('Selecione o morador associado à transação.');
      return;
    }

    // Regra de Negócio: Impede envio de Receita para menores de 18 anos
    if (selectedPessoa && selectedPessoa.idade < 18 && tipo === 'Receita') {
      setFormError(`Operação bloqueada. ${selectedPessoa.nome} é menor de 18 anos (${selectedPessoa.idade} anos) e não pode cadastrar receitas.`);
      return;
    }

    try {
      setSubmitting(true);
      await transacoesService.create({
        descricao: descricao.trim(),
        valor: valorNum,
        tipo,
        pessoaId
      });

      setFormSuccess('Transação registrada com sucesso!');
      
      // Reseta campos do form
      setDescricao('');
      setValor('');
      setTipo('Despesa');
      setPessoaId('');
      setSelectedPessoa(null);

      // Recarrega a lista de transações
      const transacoesData = await transacoesService.getAll();
      setTransacoes(transacoesData);

      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao registrar transação.');
    } finally {
      setSubmitting(false);
    }
  };

  // Formata moeda para Real Brasileiro (R$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading && transacoes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium">Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Cadastro de Transações</h1>
        <p className="mt-2 text-slate-400">Registre receitas e despesas associadas aos moradores cadastrados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
          <h2 className="text-lg font-bold text-white mb-4">Nova Transação</h2>

          {pessoas.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">Nenhum morador disponível.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">É necessário cadastrar uma pessoa no sistema antes de criar transações.</p>
              <a
                href="/pessoas"
                className="inline-block px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Cadastrar Morador
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pessoa Seleção */}
              <div>
                <label htmlFor="pessoa" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Morador Responsável
                </label>
                <select
                  id="pessoa"
                  value={pessoaId}
                  onChange={(e) => setPessoaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                  disabled={submitting}
                >
                  <option value="">Selecione um morador...</option>
                  {pessoas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.idade} {p.idade === 1 ? 'ano' : 'anos'})
                    </option>
                  ))}
                </select>
                {selectedPessoa && (
                  <p className={`text-xs mt-1.5 font-medium ${selectedPessoa.idade < 18 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {selectedPessoa.idade < 18 
                      ? '⚠️ Morador menor de 18 anos. Permitido apenas despesas.' 
                      : '✓ Morador maior de idade. Permitido despesas e receitas.'}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Aluguel, Supermercado, Salário"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  disabled={submitting}
                />
              </div>

              {/* Valor */}
              <div>
                <label htmlFor="valor" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  id="valor"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  disabled={submitting}
                />
              </div>

              {/* Tipo (Despesa / Receita) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tipo de Transação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTipoChange('Despesa')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      tipo === 'Despesa'
                        ? 'bg-rose-950/30 text-rose-450 border-rose-800/60 shadow-inner'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                    disabled={submitting}
                  >
                    Despesa (Débito)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoChange('Receita')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      tipo === 'Receita'
                        ? 'bg-emerald-950/30 text-emerald-450 border-emerald-800/60 shadow-inner'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                    disabled={submitting || (selectedPessoa !== null && selectedPessoa.idade < 18)}
                  >
                    Receita (Crédito)
                  </button>
                </div>
              </div>

              {/* Feedbacks de Validação do Form */}
              {formError && (
                <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-xl text-xs text-rose-400 font-medium">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-400 font-medium">
                  {formSuccess}
                </div>
              )}

              {/* Envio */}
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/10 transition-all duration-200 active:scale-98"
                disabled={submitting || (selectedPessoa !== null && selectedPessoa.idade < 18 && tipo === 'Receita')}
              >
                {submitting ? 'Registrando...' : 'Registrar Transação'}
              </button>
            </form>
          )}
        </div>

        {/* Tabela de Listagem de Transações */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Extrato de Transações</h2>
            <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-800 rounded-full">
              {transacoes.length} {transacoes.length === 1 ? 'Transação' : 'Transações'}
            </span>
          </div>

          {error && (
            <div className="p-6 text-center text-rose-400 text-sm">
              {error}
            </div>
          )}

          {transacoes.length === 0 && !error ? (
            <div className="px-6 py-16 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-700" fill="none" viewBox="0/0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-sm font-bold text-slate-450">Nenhuma transação cadastrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Cadastre despesas ou receitas utilizando o formulário ao lado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-900/10">
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Responsável</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {transacoes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{t.descricao}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-350">{t.nomePessoa}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.tipo === 'Receita' 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                            : 'bg-rose-950/40 text-rose-450 border border-rose-900/30'
                        }`}>
                          {t.tipo === 'Receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        t.tipo === 'Receita' ? 'text-emerald-450' : 'text-rose-450'
                      }`}>
                        {t.tipo === 'Receita' ? '+' : '-'} {formatCurrency(t.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
