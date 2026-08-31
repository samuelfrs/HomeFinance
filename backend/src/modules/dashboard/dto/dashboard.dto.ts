import { ApiProperty } from '@nestjs/swagger';

export class PessoaTotalDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Samuel Farias' })
  nome: string;

  @ApiProperty({ example: 24 })
  idade: number;

  @ApiProperty({ example: 5000.0 })
  totalReceitas: number;

  @ApiProperty({ example: 1500.0 })
  totalDespesas: number;

  @ApiProperty({ example: 3500.0 })
  saldo: number;
}

export class TotalGeralDto {
  @ApiProperty({ example: 8000.0 })
  totalReceitasGeral: number;

  @ApiProperty({ example: 3000.0 })
  totalDespesasGeral: number;

  @ApiProperty({ example: 5000.0 })
  saldoLiquidoGeral: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: [PessoaTotalDto] })
  pessoasTotais: PessoaTotalDto[];

  @ApiProperty({ type: TotalGeralDto })
  totalGeral: TotalGeralDto;
}
