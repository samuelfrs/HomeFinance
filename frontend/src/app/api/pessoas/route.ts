import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/pessoas - Listar todas as pessoas
export async function GET() {
  try {
    const pessoas = await prisma.pessoa.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(pessoas);
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao listar moradores.', error: error.message },
      { status: 500 },
    );
  }
}

// POST /api/pessoas - Criar nova pessoa
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const novaPessoa = await prisma.pessoa.create({
      data: {
        nome,
        idade,
      },
    });

    return NextResponse.json(novaPessoa, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { mensagem: 'Erro ao criar morador.', error: error.message },
      { status: 500 },
    );
  }
}
