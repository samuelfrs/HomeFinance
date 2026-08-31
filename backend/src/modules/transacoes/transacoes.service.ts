import { Injectable, BadRequestException } from '@nestjs/common';
import { TipoTransacao } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';

@Injectable()
export class TransacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pessoaId?: string) {
    const transacoes = await this.prisma.transacao.findMany({
      where: pessoaId ? { pessoaId } : undefined,
      include: {
        pessoa: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });

    return transacoes.map((t) => ({
      id: t.id,
      descricao: t.descricao,
      valor: t.valor,
      tipo: t.tipo,
      data: t.data.toISOString(),
      pessoaId: t.pessoaId,
      nomePessoa: t.pessoa?.nome || 'Desconhecido',
    }));
  }

  async create(createTransacaoDto: CreateTransacaoDto) {
    const descricao = createTransacaoDto.descricao.trim();

    if (!descricao) {
      throw new BadRequestException('A descrição da transação é obrigatória.');
    }

    if (createTransacaoDto.valor <= 0) {
      throw new BadRequestException('O valor da transação deve ser maior que zero.');
    }

    // Busca o morador para validar existência e regras de idade
    const pessoa = await this.prisma.pessoa.findUnique({
      where: { id: createTransacaoDto.pessoaId },
    });

    if (!pessoa) {
      throw new BadRequestException('A pessoa informada não existe no cadastro.');
    }

    // Regra de Negócio: Menores de 18 anos são impedidos de registrar Receitas
    if (pessoa.idade < 18 && createTransacaoDto.tipo === TipoTransacao.Receita) {
      throw new BadRequestException(
        `Não é permitido cadastrar receitas para menores de 18 anos. ${pessoa.nome} possui apenas ${pessoa.idade} anos.`,
      );
    }

    const transacao = await this.prisma.transacao.create({
      data: {
        descricao,
        valor: createTransacaoDto.valor,
        tipo: createTransacaoDto.tipo,
        data: new Date(createTransacaoDto.data),
        pessoaId: createTransacaoDto.pessoaId,
      },
      include: {
        pessoa: {
          select: {
            nome: true,
          },
        },
      },
    });

    return {
      id: transacao.id,
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      data: transacao.data.toISOString(),
      pessoaId: transacao.pessoaId,
      nomePessoa: transacao.pessoa?.nome || pessoa.nome,
    };
  }
}
