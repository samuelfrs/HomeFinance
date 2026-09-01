import { PrismaClient, TipoTransacao } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados HomeFinance no Supabase...');

  // 1. Limpa registros anteriores para evitar duplicidade
  await prisma.transacao.deleteMany();
  await prisma.pessoa.deleteMany();

  console.log('🧹 Banco de dados limpo com sucesso.');

  // 2. Cria Moradores (Adultos e Menores de Idade)
  const samuel = await prisma.pessoa.create({
    data: {
      nome: 'Samuel Farias',
      idade: 24,
    },
  });

  const camila = await prisma.pessoa.create({
    data: {
      nome: 'Camila Silva',
      idade: 28,
    },
  });

  const lucas = await prisma.pessoa.create({
    data: {
      nome: 'Lucas Farias',
      idade: 16, // Menor de 18 anos (apenas Despesas permitidas)
    },
  });

  const mariana = await prisma.pessoa.create({
    data: {
      nome: 'Mariana Souza',
      idade: 32,
    },
  });

  console.log('👥 Moradores cadastrados:');
  console.log(` - ${samuel.nome} (Idade: ${samuel.idade})`);
  console.log(` - ${camila.nome} (Idade: ${camila.idade})`);
  console.log(` - ${lucas.nome} (Idade: ${lucas.idade}) [Menor de idade]`);
  console.log(` - ${mariana.nome} (Idade: ${mariana.idade})`);

  // 3. Cria Transações (Receitas e Despesas)
  const transacoesData = [
    // Transações do Samuel (Adulto)
    {
      descricao: 'Salário Mensal - Engenharia de Software',
      valor: 7500.0,
      tipo: TipoTransacao.Receita,
      data: new Date('2026-08-05T10:00:00Z'),
      pessoaId: samuel.id,
    },
    {
      descricao: 'Projeto Freelance - Landing Page',
      valor: 2200.0,
      tipo: TipoTransacao.Receita,
      data: new Date('2026-08-15T14:30:00Z'),
      pessoaId: samuel.id,
    },
    {
      descricao: 'Aluguel e Condomínio',
      valor: 2100.0,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-10T09:00:00Z'),
      pessoaId: samuel.id,
    },
    {
      descricao: 'Supermercado Mensal',
      valor: 850.4,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-18T18:20:00Z'),
      pessoaId: samuel.id,
    },

    // Transações da Camila (Adulto)
    {
      descricao: 'Salário - Gestão de Projetos',
      valor: 6800.0,
      tipo: TipoTransacao.Receita,
      data: new Date('2026-08-05T11:00:00Z'),
      pessoaId: camila.id,
    },
    {
      descricao: 'Conta de Energia (Enel)',
      valor: 340.5,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-12T16:00:00Z'),
      pessoaId: camila.id,
    },
    {
      descricao: 'Internet Fibra Óptica',
      valor: 149.9,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-14T08:30:00Z'),
      pessoaId: camila.id,
    },
    {
      descricao: 'Farmácia e Cuidados',
      valor: 185.0,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-22T19:45:00Z'),
      pessoaId: camila.id,
    },

    // Transações do Lucas (Menor de 18 anos - Apenas DESPESAS)
    {
      descricao: 'Material Escolar e Livros',
      valor: 180.0,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-08T15:00:00Z'),
      pessoaId: lucas.id,
    },
    {
      descricao: 'Lanches e Transporte Escolar',
      valor: 120.0,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-20T12:30:00Z'),
      pessoaId: lucas.id,
    },
    {
      descricao: 'Assinatura Plataforma de Cursos',
      valor: 79.9,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-25T17:00:00Z'),
      pessoaId: lucas.id,
    },

    // Transações da Mariana (Adulto)
    {
      descricao: 'Honorários de Consultoria',
      valor: 5400.0,
      tipo: TipoTransacao.Receita,
      data: new Date('2026-08-07T13:00:00Z'),
      pessoaId: mariana.id,
    },
    {
      descricao: 'Manutenção Veicular',
      valor: 650.0,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-16T11:15:00Z'),
      pessoaId: mariana.id,
    },
    {
      descricao: 'Academia e Saúde',
      valor: 160.0,
      tipo: TipoTransacao.Despesa,
      data: new Date('2026-08-21T07:30:00Z'),
      pessoaId: mariana.id,
    },
  ];

  for (const transacao of transacoesData) {
    await prisma.transacao.create({
      data: transacao,
    });
  }

  console.log(`💰 ${transacoesData.length} transações financeiras cadastradas com sucesso!`);
  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
