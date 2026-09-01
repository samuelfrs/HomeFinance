import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/pessoas/[id] - Obter pessoa por ID
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const pessoa = await prisma.pessoa.findUnique({
      where: { id },
    });

    if (!pessoa) {
      return NextResponse.json(
        { mensagem: 'Pessoa não encontrada.' },
        { status: 404 },
      );
    }

    return NextResponse.json(pessoa);
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao buscar morador.', error: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/pessoas/[id] - Atualizar pessoa existente
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const pessoaExistente = await prisma.pessoa.findUnique({
      where: { id },
    });

    if (!pessoaExistente) {
      return NextResponse.json(
        { mensagem: 'Pessoa não encontrada.' },
        { status: 404 },
      );
    }

    const nome = body.nome ? String(body.nome).trim() : '';
    const idade = Number(body.idade);

    if (!nome) {
      return NextResponse.json(
        { mensagem: 'O nome da pessoa é obrigatório.' },
        { status: 400 },
      );
    }

    if (isNaN(idade) || idade < 0) {
      return NextResponse.json(
        { mensagem: 'A idade não pode ser negativa.' },
        { status: 400 },
      );
    }

    const pessoaAtualizada = await prisma.pessoa.update({
      where: { id },
      data: {
        nome,
        idade,
      },
    });

    return NextResponse.json(pessoaAtualizada);
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao atualizar morador.', error: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/pessoas/[id] - Deletar pessoa (aciona exclusão em cascata)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const pessoa = await prisma.pessoa.findUnique({
      where: { id },
    });

    if (!pessoa) {
      return NextResponse.json(
        { mensagem: 'Pessoa não encontrada.' },
        { status: 404 },
      );
    }

    await prisma.pessoa.delete({
      where: { id },
    });

    return NextResponse.json({
      mensagem: `Pessoa '${pessoa.nome}' e suas transações vinculadas foram removidas com sucesso.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao excluir morador.', error: error.message },
      { status: 500 },
    );
  }
}
