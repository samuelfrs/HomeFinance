import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoTransacao } from '@prisma/client';

// GET /api/transacoes - Listar transações com filtro opcional por pessoaId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pessoaId = searchParams.get('pessoaId') || undefined;

    const transacoes = await prisma.transacao.findMany({
      where: pessoaId ? { pessoaId } : undefined,
      include: {
        pessoa: {
          select: { nome: true },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });

    const formatted = transacoes.map((t) => ({
      id: t.id,
      descricao: t.descricao,
      valor: t.valor,
      tipo: t.tipo,
      data: t.data.toISOString(),
      pessoaId: t.pessoaId,
      nomePessoa: t.pessoa?.nome || 'Desconhecido',
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao listar transações.', error: error.message },
      { status: 500 },
    );
  }
}

// POST /api/transacoes - Criar nova transação com validação da regra de idade
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const descricao = body.descricao ? String(body.descricao).trim() : '';
    const valor = Number(body.valor);
    const tipo = body.tipo as TipoTransacao;
    const dataStr = body.data;
    const pessoaId = body.pessoaId;

    if (!descricao) {
      return NextResponse.json(
        { mensagem: 'A descrição da transação é obrigatória.' },
        { status: 400 },
      );
    }

    if (isNaN(valor) || valor <= 0) {
      return NextResponse.json(
        { mensagem: 'O valor da transação deve ser maior que zero.' },
        { status: 400 },
      );
    }

    if (!tipo || (tipo !== 'Receita' && tipo !== 'Despesa')) {
      return NextResponse.json(
        { mensagem: 'O tipo da transação deve ser "Receita" ou "Despesa".' },
        { status: 400 },
      );
    }

    if (!pessoaId) {
      return NextResponse.json(
        { mensagem: 'O ID da pessoa é obrigatório.' },
        { status: 400 },
      );
    }

    // Busca o morador para validação da regra de negócio
    const pessoa = await prisma.pessoa.findUnique({
      where: { id: pessoaId },
    });

    if (!pessoa) {
      return NextResponse.json(
        { mensagem: 'A pessoa informada não existe no cadastro.' },
        { status: 400 },
      );
    }

    // Regra de Negócio: Menores de 18 anos são impedidos de registrar Receitas
    if (pessoa.idade < 18 && tipo === 'Receita') {
      return NextResponse.json(
        {
          mensagem: `Não é permitido cadastrar receitas para menores de 18 anos. ${pessoa.nome} possui apenas ${pessoa.idade} anos.`,
        },
        { status: 400 },
      );
    }

    const transacao = await prisma.transacao.create({
      data: {
        descricao,
        valor,
        tipo,
        data: dataStr ? new Date(dataStr) : new Date(),
        pessoaId,
      },
      include: {
        pessoa: {
          select: { nome: true },
        },
      },
    });

    return NextResponse.json(
      {
        id: transacao.id,
        descricao: transacao.descricao,
        valor: transacao.valor,
        tipo: transacao.tipo,
        data: transacao.data.toISOString(),
        pessoaId: transacao.pessoaId,
        nomePessoa: transacao.pessoa?.nome || pessoa.nome,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao criar transação.', error: error.message },
      { status: 500 },
    );
  }
}
