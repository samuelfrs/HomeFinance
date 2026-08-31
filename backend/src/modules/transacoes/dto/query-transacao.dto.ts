import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryTransacaoDto {
  @ApiPropertyOptional({
    description: 'Filtro opcional por ID do morador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'O ID da pessoa para filtro deve ser um UUID v4 válido.' })
  pessoaId?: string;
}
