import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('HomeFinance API (E2E Tests)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Limpa dados prévios no banco de testes
    await prisma.transacao.deleteMany();
    await prisma.pessoa.deleteMany();
  });

  afterAll(async () => {
    await prisma.transacao.deleteMany();
    await prisma.pessoa.deleteMany();
    await app.close();
  });

  describe('1. Gerenciamento de Pessoas (CRUD)', () => {
    let pessoaCriadaId: string;

    it('POST /api/pessoas -> deve criar um morador com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pessoas')
        .send({
          nome: 'Samuel Farias',
          idade: 24,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe('Samuel Farias');
      expect(response.body.idade).toBe(24);
      pessoaCriadaId = response.body.id;
    });

    it('POST /api/pessoas -> deve falhar ao criar morador com idade negativa', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pessoas')
        .send({
          nome: 'Invalido',
          idade: -5,
        })
        .expect(400);

      expect(response.body.mensagem).toBeDefined();
    });

    it('GET /api/pessoas -> deve listar moradores cadastrados', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/pessoas')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((p: any) => p.id === pessoaCriadaId)).toBe(true);
    });

    it('GET /api/pessoas/:id -> deve retornar detalhes do morador por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pessoas/${pessoaCriadaId}`)
        .expect(200);

      expect(response.body.id).toBe(pessoaCriadaId);
      expect(response.body.nome).toBe('Samuel Farias');
    });

    it('PUT /api/pessoas/:id -> deve atualizar dados do morador', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/pessoas/${pessoaCriadaId}`)
        .send({
          nome: 'Samuel Farias Editado',
          idade: 25,
        })
        .expect(200);

      expect(response.body.nome).toBe('Samuel Farias Editado');
      expect(response.body.idade).toBe(25);
    });
  });

  describe('2. Regras de Negócio de Transações', () => {
    let adultoId: string;
    let menorId: string;

    beforeAll(async () => {
      const adultoRes = await request(app.getHttpServer())
        .post('/api/pessoas')
        .send({ nome: 'Adulto Teste', idade: 30 });
      adultoId = adultoRes.body.id;

      const menorRes = await request(app.getHttpServer())
        .post('/api/pessoas')
        .send({ nome: 'Menor Teste', idade: 16 });
      menorId = menorRes.body.id;
    });

    it('POST /api/transacoes -> deve permitir criar DESPESA para menor de 18 anos', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/transacoes')
        .send({
          descricao: 'Lanche Escolar',
          valor: 25.5,
          tipo: 'Despesa',
          data: new Date().toISOString(),
          pessoaId: menorId,
        })
        .expect(201);

      expect(response.body.descricao).toBe('Lanche Escolar');
      expect(response.body.tipo).toBe('Despesa');
      expect(response.body.nomePessoa).toBe('Menor Teste');
    });

    it('POST /api/transacoes -> DEVE BLOQUEAR criação de RECEITA para menor de 18 anos (Regra de Negócio)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/transacoes')
        .send({
          descricao: 'Salário de Menor',
          valor: 1500.0,
          tipo: 'Receita',
          data: new Date().toISOString(),
          pessoaId: menorId,
        })
        .expect(400);

      expect(response.body.mensagem).toContain(
        'Não é permitido cadastrar receitas para menores de 18 anos',
      );
    });

    it('POST /api/transacoes -> deve permitir criar RECEITA para maior de 18 anos', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/transacoes')
        .send({
          descricao: 'Salário Adulto',
          valor: 5000.0,
          tipo: 'Receita',
          data: new Date().toISOString(),
          pessoaId: adultoId,
        })
        .expect(201);

      expect(response.body.descricao).toBe('Salário Adulto');
      expect(response.body.tipo).toBe('Receita');
      expect(response.body.valor).toBe(5000.0);
    });

    it('GET /api/transacoes?pessoaId=... -> deve filtrar transações por morador', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/transacoes?pessoaId=${menorId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].pessoaId).toBe(menorId);
    });
  });

  describe('3. Consolidação do Dashboard de Totais', () => {
    it('GET /api/dashboard -> deve calcular os totais e saldos individuais e gerais corretamente', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('pessoasTotais');
      expect(response.body).toHaveProperty('totalGeral');

      const { totalGeral, pessoasTotais } = response.body;

      // Valida que o saldo individual é receitas - despesas
      pessoasTotais.forEach((p: any) => {
        expect(p.saldo).toBeCloseTo(p.totalReceitas - p.totalDespesas, 2);
      });

      // Valida somatório geral
      expect(totalGeral.totalReceitasGeral).toBeGreaterThanOrEqual(5000);
      expect(totalGeral.totalDespesasGeral).toBeGreaterThanOrEqual(25.5);
      expect(totalGeral.saldoLiquidoGeral).toBeCloseTo(
        totalGeral.totalReceitasGeral - totalGeral.totalDespesasGeral,
        2,
      );
    });
  });

  describe('4. Deleção em Cascata (Cascade Delete)', () => {
    it('DELETE /api/pessoas/:id -> deve deletar morador e apagar automaticamente todas as transações vinculadas', async () => {
      // Cria morador efêmero
      const moradorRes = await request(app.getHttpServer())
        .post('/api/pessoas')
        .send({ nome: 'Morador Cascata', idade: 35 });
      const moradorId = moradorRes.body.id;

      // Cria 2 transações para esse morador
      await request(app.getHttpServer())
        .post('/api/transacoes')
        .send({
          descricao: 'Transação 1',
          valor: 100,
          tipo: 'Despesa',
          data: new Date().toISOString(),
          pessoaId: moradorId,
        });

      await request(app.getHttpServer())
        .post('/api/transacoes')
        .send({
          descricao: 'Transação 2',
          valor: 300,
          tipo: 'Receita',
          data: new Date().toISOString(),
          pessoaId: moradorId,
        });

      // Confirma que existem 2 transações no banco
      const transacoesAntes = await prisma.transacao.findMany({
        where: { pessoaId: moradorId },
      });
      expect(transacoesAntes.length).toBe(2);

      // Deleta o morador
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/pessoas/${moradorId}`)
        .expect(200);

      expect(deleteRes.body.mensagem).toContain('removidas com sucesso');

      // Verifica que as transações foram removidas em cascata
      const transacoesDepois = await prisma.transacao.findMany({
        where: { pessoaId: moradorId },
      });
      expect(transacoesDepois.length).toBe(0);
    });
  });
});
