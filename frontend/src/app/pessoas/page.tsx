'use client';

import { useEffect, useState } from 'react';
import { pessoasService, Pessoa } from '@/services/api';

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Formulário (Criação e Edição)
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [editPessoaId, setEditPessoaId] = useState<string | null>(null);
  
  // Estados de Validação e Feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados de confirmação de exclusão em cascata
  const [pessoaParaExcluir, setPessoaParaExcluir] = useState<Pessoa | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Busca lista de pessoas cadastrada
  const fetchPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pessoasService.getAll();
      setPessoas(data);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar moradores. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  // Envio do formulário (Criar ou Atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validações locais antes da API
    if (!nome.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }

    const idadeNum = parseInt(idade, 10);
    if (isNaN(idadeNum) || idadeNum < 0) {
      setFormError('Por favor, informe uma idade válida (zero ou maior).');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editPessoaId) {
        // Modo Edição
        await pessoasService.update(editPessoaId, { nome: nome.trim(), idade: idadeNum });
        setFormSuccess('Dados do morador atualizados com sucesso!');
      } else {
        // Modo Cadastro
        await pessoasService.create({ nome: nome.trim(), idade: idadeNum });
        setFormSuccess('Morador cadastrado com sucesso!');
      }

      // Reseta o formulário
      setNome('');
      setIdade('');
      setEditPessoaId(null);
      
      // Recarrega a lista
      await fetchPessoas();

      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao salvar morador.');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepara o formulário para edição de uma pessoa
  const handleEditClick = (pessoa: Pessoa) => {
    setEditPessoaId(pessoa.id);
    setNome(pessoa.nome);
    setIdade(pessoa.idade.toString());
    setFormError(null);
    setFormSuccess(null);
    
    // Rola a tela até o formulário de forma suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancela a edição voltando ao modo cadastro
  const handleCancelEdit = () => {
    setEditPessoaId(null);
    setNome('');
    setIdade('');
    setFormError(null);
  };

  // Confirmação de exclusão em cascata
  const handleDeleteConfirm = async () => {
    if (!pessoaParaExcluir) return;

    try {
      setDeleteLoading(true);
      await pessoasService.delete(pessoaParaExcluir.id);
      
      setPessoas(pessoas.filter(p => p.id !== pessoaParaExcluir.id));
      setPessoaParaExcluir(null);
      
      setFormSuccess(`Morador '${pessoaParaExcluir.nome}' e todas as suas transações vinculadas foram removidos.`);
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao excluir morador.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && pessoas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium">Carregando moradores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Modal de Confirmação de Exclusão em Cascata */}
      {pessoaParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0/0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirmar Exclusão
            </h3>
            <p className="mt-3 text-slate-350 text-sm leading-relaxed">
              Você está prestes a excluir <span className="font-bold text-white">{pessoaParaExcluir.nome}</span>.
            </p>
            <div className="mt-3 p-3 bg-rose-950/20 border border-rose-800/25 rounded-xl">
              <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                ⚠️ Regra de Exclusão em Cascata:
              </p>
              <p className="text-xs text-rose-300 mt-1">
                Todas as receitas e despesas vinculadas a este morador serão apagadas permanentemente do banco de dados. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPessoaParaExcluir(null)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-colors"
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/10 transition-colors flex items-center gap-2"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Gerenciamento de Pessoas</h1>
        <p className="mt-2 text-slate-400">Cadastre, edite e remova os moradores participantes do orçamento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário de Cadastro / Edição */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
          <h2 className="text-lg font-bold text-white mb-4">
            {editPessoaId ? 'Editar Morador' : 'Cadastrar Novo Morador'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nome */}
            <div>
              <label htmlFor="nome" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                disabled={submitting}
              />
            </div>

            {/* Input Idade */}
            <div>
              <label htmlFor="idade" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Idade
              </label>
              <input
                type="number"
                id="idade"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 28"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                disabled={submitting}
              />
            </div>

            {/* Mensagem de Erro do Form */}
            {formError && (
              <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-xl text-xs text-rose-400 font-medium">
                {formError}
              </div>
            )}

            {/* Mensagem de Sucesso do Form */}
            {formSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-400 font-medium">
                {formSuccess}
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/10 transition-all duration-200 active:scale-98"
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : editPessoaId ? 'Salvar Alterações' : 'Cadastrar Morador'}
              </button>
              
              {editPessoaId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800/30 text-slate-400 hover:text-slate-200 rounded-xl text-sm font-semibold transition-all"
                  disabled={submitting}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela de Listagem */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Moradores Cadastrados</h2>
            <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-800 rounded-full">
              {pessoas.length} {pessoas.length === 1 ? 'Morador' : 'Moradores'}
            </span>
          </div>

          {error && (
            <div className="p-6 text-center text-rose-400 text-sm">
              {error}
            </div>
          )}

          {pessoas.length === 0 && !error ? (
            <div className="px-6 py-16 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-700" fill="none" viewBox="0/0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-450">Nenhum morador cadastrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Insira o nome e a idade no formulário ao lado para cadastrar a primeira pessoa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-900/10">
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Idade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {pessoas.map((pessoa) => (
                    <tr key={pessoa.id} className="hover:bg-slate-850/10 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white">{pessoa.nome}</td>
                      <td className="px-6 py-4 text-slate-400">{pessoa.idade} {pessoa.idade === 1 ? 'ano' : 'anos'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => handleEditClick(pessoa)}
                            className="text-slate-450 hover:text-violet-400 text-xs font-semibold transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setPessoaParaExcluir(pessoa)}
                            className="text-slate-500 hover:text-rose-450 text-xs font-semibold transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
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
