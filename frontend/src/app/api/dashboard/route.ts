import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoTransacao } from '@prisma/client';

// GET /api/dashboard - Resumo consolidado de saldos individuais e geral
export async function GET() {
  try {
    const pessoas = await prisma.pessoa.findMany({
      include: {
        transacoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    const pessoasTotais = pessoas.map((pessoa) => {
      const totalReceitas = pessoa.transacoes
        .filter((t) => t.tipo === TipoTransacao.Receita)
        .reduce((acc, curr) => acc + curr.valor, 0);

      const totalDespesas = pessoa.transacoes
        .filter((t) => t.tipo === TipoTransacao.Despesa)
        .reduce((acc, curr) => acc + curr.valor, 0);

      const saldo = totalReceitas - totalDespesas;

      return {
        id: pessoa.id,
        nome: pessoa.nome,
        idade: pessoa.idade,
        totalReceitas: Number(totalReceitas.toFixed(2)),
        totalDespesas: Number(totalDespesas.toFixed(2)),
        saldo: Number(saldo.toFixed(2)),
      };
    });

    const totalReceitasGeral = pessoasTotais.reduce(
      (acc, curr) => acc + curr.totalReceitas,
      0,
    );
    const totalDespesasGeral = pessoasTotais.reduce(
      (acc, curr) => acc + curr.totalDespesas,
      0,
    );
    const saldoLiquidoGeral = totalReceitasGeral - totalDespesasGeral;

    return NextResponse.json({
      pessoasTotais,
      totalGeral: {
        totalReceitasGeral: Number(totalReceitasGeral.toFixed(2)),
        totalDespesasGeral: Number(totalDespesasGeral.toFixed(2)),
        saldoLiquidoGeral: Number(saldoLiquidoGeral.toFixed(2)),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao carregar dados do dashboard.', error: error.message },
      { status: 500 },
    );
  }
}
