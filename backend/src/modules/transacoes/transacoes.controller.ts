import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransacoesService } from './transacoes.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { QueryTransacaoDto } from './dto/query-transacao.dto';

@ApiTags('Transações')
@Controller('transacoes')
export class TransacoesController {
  constructor(private readonly transacoesService: TransacoesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar transações (ordenadas cronologicamente da mais recente para a mais antiga)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de transações retornada com sucesso.',
  })
  async findAll(@Query() query: QueryTransacaoDto) {
    return this.transacoesService.findAll(query.pessoaId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar nova transação (valida restrição de menores de 18 anos para receitas)',
  })
  @ApiResponse({
    status: 201,
    description: 'Transação cadastrada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validação falhou ou morador menor de 18 anos tentando lançar receita.',
  })
  async create(@Body() createTransacaoDto: CreateTransacaoDto) {
    return this.transacoesService.create(createTransacaoDto);
  }
}
