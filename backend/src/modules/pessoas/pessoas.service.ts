import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pessoa.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const pessoa = await this.prisma.pessoa.findUnique({
      where: { id },
    });

    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada.');
    }

    return pessoa;
  }

  async create(createPessoaDto: CreatePessoaDto) {
    const nome = createPessoaDto.nome.trim();

    if (!nome) {
      throw new BadRequestException('O nome da pessoa é obrigatório.');
    }

    if (createPessoaDto.idade < 0) {
      throw new BadRequestException('A idade não pode ser negativa.');
    }

    return this.prisma.pessoa.create({
      data: {
        nome,
        idade: createPessoaDto.idade,
      },
    });
  }

  async update(id: string, updatePessoaDto: UpdatePessoaDto) {
    await this.findOne(id);

    const nome = updatePessoaDto.nome.trim();

    if (!nome) {
      throw new BadRequestException('O nome da pessoa é obrigatório.');
    }

    if (updatePessoaDto.idade < 0) {
      throw new BadRequestException('A idade não pode ser negativa.');
    }

    return this.prisma.pessoa.update({
      where: { id },
      data: {
        nome,
        idade: updatePessoaDto.idade,
      },
    });
  }

  async remove(id: string) {
    const pessoa = await this.findOne(id);

    // O Cascade Delete configurado no Prisma schema remove automaticamente as transações vinculadas
    await this.prisma.pessoa.delete({
      where: { id },
    });

    return {
      mensagem: `Pessoa '${pessoa.nome}' e suas transações vinculadas foram removidas com sucesso.`,
    };
  }
}
