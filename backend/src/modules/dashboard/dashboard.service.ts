import { Injectable } from '@nestjs/common';
import { TipoTransacao } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardResponseDto, PessoaTotalDto, TotalGeralDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(): Promise<DashboardResponseDto> {
    const pessoas = await this.prisma.pessoa.findMany({
      include: {
        transacoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    const pessoasTotais: PessoaTotalDto[] = pessoas.map((pessoa) => {
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

    const totalGeral: TotalGeralDto = {
      totalReceitasGeral: Number(totalReceitasGeral.toFixed(2)),
      totalDespesasGeral: Number(totalDespesasGeral.toFixed(2)),
      saldoLiquidoGeral: Number(saldoLiquidoGeral.toFixed(2)),
    };

    return {
      pessoasTotais,
      totalGeral,
    };
  }
}
