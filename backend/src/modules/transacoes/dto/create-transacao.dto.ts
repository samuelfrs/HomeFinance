import { ApiProperty } from '@nestjs/swagger';
import { TipoTransacao } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateTransacaoDto {
  @ApiProperty({
    description: 'Descrição da transação financeira',
    example: 'Salário Mensal',
  })
  @IsString({ message: 'A descrição deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A descrição da transação é obrigatória.' })
  descricao: string;

  @ApiProperty({
    description: 'Valor monetário da transação (deve ser maior que zero)',
    example: 3500.50,
  })
  @IsNumber({}, { message: 'O valor deve ser um número válido.' })
  @IsPositive({ message: 'O valor da transação deve ser maior que zero.' })
  valor: number;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: TipoTransacao,
    example: TipoTransacao.Receita,
  })
  @IsEnum(TipoTransacao, { message: 'O tipo da transação deve ser "Receita" ou "Despesa".' })
  tipo: TipoTransacao;

  @ApiProperty({
    description: 'Data da movimentação em formato ISO 8601',
    example: '2026-08-31T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'A data deve estar em formato ISO 8601 válido.' })
  data: string;

  @ApiProperty({
    description: 'ID do morador associado à transação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O ID da pessoa deve ser um UUID v4 válido.' })
  @IsNotEmpty({ message: 'O ID da pessoa é obrigatório.' })
  pessoaId: string;
}
