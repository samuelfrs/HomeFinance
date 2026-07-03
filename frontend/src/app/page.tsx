'use client';

import { useEffect, useState } from 'react';
import { dashboardService, DashboardData } from '@/services/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca os dados consolidados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível conectar ao servidor backend. Certifique-se de que a API .NET está rodando em http://localhost:5090.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Formata os números para Real Brasileiro (R$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        {/* Spinner animado moderno */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Carregando dados financeiros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] max-w-lg mx-auto text-center px-4">
        <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-400 mb-6">
          <svg className="w-12 h-12 mx-auto mb-2 text-red-500" fill="none" viewBox="0/0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-semibold text-lg block mb-1">Falha na Conexão</span>
          <p className="text-sm text-slate-300">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 active:scale-95"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { totalGeral, pessoasTotais } = data || {
    totalGeral: { totalReceitasGeral: 0, totalDespesasGeral: 0, saldoLiquidoGeral: 0 },
    pessoasTotais: []
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Consolidado</h1>
        <p className="mt-2 text-slate-400">Resumo financeiro geral e saldos individuais dos moradores.</p>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Receitas */}
        <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/30 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0/0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2v3a1 1 0 001.223.979l7-1.5A1 1 0 0013 13.792V12a2 2 0 002-2V6a2 2 0 00-2-2H4zm8 2v3a1 1 0 11-2 0V6H4v4h10V6h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-400">Total Receitas</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 tracking-tight">
            {formatCurrency(totalGeral.totalReceitasGeral)}
          </p>
          <div className="w-12 h-1 bg-emerald-500/20 rounded-full mt-4 group-hover:bg-emerald-500/40 transition-colors"></div>
        </div>

        {/* Card Despesas */}
        <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-rose-500/30 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-500 pointer-events-none group-hover:scale-110 transition-transform">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0/0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2v3a1 1 0 001.223.979l7-1.5A1 1 0 0013 13.792V12a2 2 0 002-2V6a2 2 0 00-2-2H4zm8 2v3a1 1 0 11-2 0V6H4v4h10V6h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-400">Total Despesas</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-2 tracking-tight">
            {formatCurrency(totalGeral.totalDespesasGeral)}
          </p>
          <div className="w-12 h-1 bg-rose-500/20 rounded-full mt-4 group-hover:bg-rose-500/40 transition-colors"></div>
        </div>

        {/* Card Saldo Líquido */}
        <div className={`relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 group ${
          totalGeral.saldoLiquidoGeral >= 0 ? 'hover:border-violet-500/30' : 'hover:border-rose-500/30'
        }`}>
          <p className="text-sm font-semibold text-slate-400">Saldo Líquido Geral</p>
          <p className={`text-3xl font-extrabold mt-2 tracking-tight ${
            totalGeral.saldoLiquidoGeral >= 0 ? 'text-violet-400' : 'text-rose-500'
          }`}>
            {formatCurrency(totalGeral.saldoLiquidoGeral)}
          </p>
          <div className={`w-12 h-1 rounded-full mt-4 ${
            totalGeral.saldoLiquidoGeral >= 0 ? 'bg-violet-500/20 group-hover:bg-violet-500/40' : 'bg-rose-500/20 group-hover:bg-rose-500/40'
          } transition-colors`}></div>
        </div>
      </div>

      {/* Seção da Tabela com Saldos Individuais */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Saldos por Pessoa</h2>
          <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-800 rounded-full">
            {pessoasTotais.length} {pessoasTotais.length === 1 ? 'Morador' : 'Moradores'}
          </span>
        </div>

        {pessoasTotais.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0/0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-bold text-slate-300">Nenhuma pessoa cadastrada</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Cadastre moradores e transações para visualizar o relatório consolidado.</p>
            <div className="mt-6">
              <Link
                href="/pessoas"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-violet-500/10 active:scale-95"
              >
                Cadastrar Pessoa
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-900/10">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Idade</th>
                  <th className="px-6 py-4 text-right">Total Receitas</th>
                  <th className="px-6 py-4 text-right">Total Despesas</th>
                  <th className="px-6 py-4 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {pessoasTotais.map((pessoa) => (
                  <tr key={pessoa.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{pessoa.nome}</td>
                    <td className="px-6 py-4 text-slate-400">{pessoa.idade} {pessoa.idade === 1 ? 'ano' : 'anos'}</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-medium">
                      {pessoa.totalReceitas > 0 ? formatCurrency(pessoa.totalReceitas) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-400 font-medium">
                      {pessoa.totalDespesas > 0 ? formatCurrency(pessoa.totalDespesas) : '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      pessoa.saldo > 0 ? 'text-violet-400' : pessoa.saldo < 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}>
                      {formatCurrency(pessoa.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
