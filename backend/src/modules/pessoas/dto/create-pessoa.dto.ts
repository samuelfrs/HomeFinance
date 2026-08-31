import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePessoaDto {
  @ApiProperty({
    description: 'Nome completo do morador',
    example: 'Samuel Farias',
  })
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O nome da pessoa é obrigatório.' })
  nome: string;

  @ApiProperty({
    description: 'Idade do morador',
    example: 24,
    minimum: 0,
  })
  @IsInt({ message: 'A idade deve ser um número inteiro.' })
  @Min(0, { message: 'A idade não pode ser negativa.' })
  idade: number;
}
