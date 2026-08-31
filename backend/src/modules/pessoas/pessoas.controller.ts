import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as pessoas cadastradas' })
  @ApiResponse({ status: 200, description: 'Lista de pessoas retornada com sucesso.' })
  async findAll() {
    return this.pessoasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma pessoa por ID' })
  @ApiParam({ name: 'id', description: 'UUID da pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa encontrada.' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pessoasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar nova pessoa' })
  @ApiResponse({ status: 201, description: 'Pessoa criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos.' })
  async create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar os dados de uma pessoa' })
  @ApiParam({ name: 'id', description: 'UUID da pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePessoaDto: UpdatePessoaDto,
  ) {
    return this.pessoasService.update(id, updatePessoaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar uma pessoa (aciona exclusão em cascata das transações)' })
  @ApiParam({ name: 'id', description: 'UUID da pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa e transações removidas com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pessoasService.remove(id);
  }
}
