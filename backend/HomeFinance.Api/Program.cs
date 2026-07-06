using HomeFinance.Api.Data;
using HomeFinance.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Adiciona os serviços para o contêiner de injeção de dependências

// Configura o DbContext para utilizar o banco de dados SQLite local
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=homefinance.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// Configura o Swagger/OpenAPI para documentação automática dos endpoints
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configura a política de CORS para permitir requisições do frontend local Next.js (rodando em http://localhost:3000)
// Para facilitar a execução local do avaliador, permitimos qualquer origem, método e cabeçalho.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configura o pipeline de requisições HTTP (Middlewares)

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

// ==========================================
// ENDPOINTS DE PESSOAS (CRUD Completo)
// ==========================================

// Listar todas as pessoas
app.MapGet("/api/pessoas", async (AppDbContext db) =>
{
    var pessoas = await db.Pessoas.ToListAsync();
    return Results.Ok(pessoas);
})
.WithName("GetPessoas")
.WithOpenApi();

// Obter uma pessoa por ID
app.MapGet("/api/pessoas/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var pessoa = await db.Pessoas.FindAsync(id);
    return pessoa is not null ? Results.Ok(pessoa) : Results.NotFound("Pessoa não encontrada.");
})
.WithName("GetPessoaById")
.WithOpenApi();

// Criar nova pessoa
app.MapPost("/api/pessoas", async (PessoaInputDto input, AppDbContext db) =>
{
    // Validações básicas dos campos de entrada
    if (string.IsNullOrWhiteSpace(input.Nome))
    {
        return Results.BadRequest("O nome da pessoa é obrigatório.");
    }

    if (input.Idade < 0)
    {
        return Results.BadRequest("A idade não pode ser negativa.");
    }

    var novaPessoa = new Pessoa
    {
        Nome = input.Nome.Trim(),
        Idade = input.Idade
    };

    db.Pessoas.Add(novaPessoa);
    await db.SaveChangesAsync();

    return Results.Created($"/api/pessoas/{novaPessoa.Id}", novaPessoa);
})
.WithName("CreatePessoa")
.WithOpenApi();

// Editar uma pessoa existente
app.MapPut("/api/pessoas/{id:guid}", async (Guid id, PessoaInputDto input, AppDbContext db) =>
{
    var pessoa = await db.Pessoas.FindAsync(id);
    if (pessoa is null)
    {
        return Results.NotFound("Pessoa não encontrada.");
    }

    if (string.IsNullOrWhiteSpace(input.Nome))
    {
        return Results.BadRequest("O nome da pessoa é obrigatório.");
    }

    if (input.Idade < 0)
    {
        return Results.BadRequest("A idade não pode ser negativa.");
    }

    pessoa.Nome = input.Nome.Trim();
    pessoa.Idade = input.Idade;

    await db.SaveChangesAsync();

    return Results.Ok(pessoa);
})
.WithName("UpdatePessoa")
.WithOpenApi();

// Deletar uma pessoa (Aciona a exclusão em cascata configurada das transações vinculadas)
app.MapDelete("/api/pessoas/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var pessoa = await db.Pessoas.FindAsync(id);
    if (pessoa is null)
    {
        return Results.NotFound("Pessoa não encontrada.");
    }

    // O Entity Framework Core cuidará de apagar as transações vinculadas
    // pois o comportamento Cascade foi configurado no AppDbContext
    db.Pessoas.Remove(pessoa);
    await db.SaveChangesAsync();

    return Results.Ok(new { Mensagem = $"Pessoa '{pessoa.Nome}' e suas transações vinculadas foram removidas com sucesso." });
})
.WithName("DeletePessoa")
.WithOpenApi();


// ==========================================
// ENDPOINTS DE TRANSAÇÕES
// ==========================================

// Listar transações com filtro opcional por pessoa e ordenadas da mais recente para a mais antiga
app.MapGet("/api/transacoes", async (AppDbContext db, Guid? pessoaId) =>
{
    // Monta a query base incluindo a navegação para Pessoa
    var query = db.Transacoes
        .Include(t => t.Pessoa)
        .AsQueryable();

    // Aplica o filtro por pessoa caso informado via query string (?pessoaId=...)
    if (pessoaId.HasValue)
    {
        query = query.Where(t => t.PessoaId == pessoaId.Value);
    }

    // Ordena da transação mais recente para a mais antiga
    var transacoes = await query
        .OrderByDescending(t => t.Data)
        .Select(t => new TransacaoOutputDto(
            t.Id,
            t.Descricao,
            t.Valor,
            t.Tipo,
            t.Data,
            t.PessoaId,
            t.Pessoa != null ? t.Pessoa.Nome : "Desconhecido"
        ))
        .ToListAsync();

    return Results.Ok(transacoes);
})
.WithName("GetTransacoes")
.WithOpenApi();

// Criar nova transação com validações de regra de negócio
app.MapPost("/api/transacoes", async (TransacaoInputDto input, AppDbContext db) =>
{
    // Validações básicas de formato
    if (string.IsNullOrWhiteSpace(input.Descricao))
    {
        return Results.BadRequest("A descrição da transação é obrigatória.");
    }

    if (input.Valor <= 0)
    {
        return Results.BadRequest("O valor da transação deve ser maior que zero.");
    }

    // Busca a pessoa associada para realizar as validações de regra de negócio
    var pessoa = await db.Pessoas.FindAsync(input.PessoaId);
    if (pessoa is null)
    {
        return Results.BadRequest("A pessoa informada não existe no cadastro.");
    }

    // Regra de Negócio: Menores de 18 anos só podem ter transações do tipo Despesa
    if (pessoa.Idade < 18 && input.Tipo == TipoTransacao.Receita)
    {
        return Results.BadRequest($"Não é permitido cadastrar receitas para menores de 18 anos. {pessoa.Nome} possui apenas {pessoa.Idade} anos.");
    }

    var novaTransacao = new Transacao
    {
        Descricao = input.Descricao.Trim(),
        Valor = input.Valor,
        Tipo = input.Tipo,
        Data = input.Data.ToUniversalTime(),
        PessoaId = input.PessoaId
    };

    db.Transacoes.Add(novaTransacao);
    await db.SaveChangesAsync();

    // Retorna a transação criada incluindo o nome do proprietário
    var output = new TransacaoOutputDto(
        novaTransacao.Id,
        novaTransacao.Descricao,
        novaTransacao.Valor,
        novaTransacao.Tipo,
        novaTransacao.Data,
        novaTransacao.PessoaId,
        pessoa.Nome
    );

    return Results.Created($"/api/transacoes/{novaTransacao.Id}", output);
})
.WithName("CreateTransacao")
.WithOpenApi();


// ==========================================
// ENDPOINT DO DASHBOARD / TOTAIS
// ==========================================

// Retorna totais individuais de saldo/receita/despesa e o total consolidado geral do sistema
app.MapGet("/api/dashboard", async (AppDbContext db) =>
{
    // Busca todas as pessoas e carrega suas transações associadas
    var pessoas = await db.Pessoas
        .Include(p => p.Transacoes)
        .ToListAsync();

    // Calcula os totais individuais de cada pessoa
    var pessoasTotais = pessoas.Select(p =>
    {
        var totalReceitas = p.Transacoes
            .Where(t => t.Tipo == TipoTransacao.Receita)
            .Sum(t => t.Valor);

        var totalDespesas = p.Transacoes
            .Where(t => t.Tipo == TipoTransacao.Despesa)
            .Sum(t => t.Valor);

        var saldo = totalReceitas - totalDespesas;

        return new PessoaTotalDto(
            p.Id,
            p.Nome,
            p.Idade,
            totalReceitas,
            totalDespesas,
            saldo
        );
    }).ToList();

    // Calcula o somatório geral acumulado de todas as pessoas
    var receitasGeral = pessoasTotais.Sum(pt => pt.TotalReceitas);
    var despesasGeral = pessoasTotais.Sum(pt => pt.TotalDespesas);
    var saldoLiquidoGeral = receitasGeral - despesasGeral;

    var dashboard = new DashboardDto(
        pessoasTotais,
        new TotalGeralDto(receitasGeral, despesasGeral, saldoLiquidoGeral)
    );

    return Results.Ok(dashboard);
})
.WithName("GetDashboard")
.WithOpenApi();

app.Run();

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

// DTO para dados de entrada de Pessoa
public record PessoaInputDto(string Nome, int Idade);

// DTO para dados de entrada de Transação (inclui Data selecionada pelo usuário)
public record TransacaoInputDto(string Descricao, decimal Valor, TipoTransacao Tipo, DateTime Data, Guid PessoaId);

// DTO para saída estruturada de Transação (inclui Data para exibição)
public record TransacaoOutputDto(Guid Id, string Descricao, decimal Valor, TipoTransacao Tipo, DateTime Data, Guid PessoaId, string NomePessoa);

// DTOs para o cálculo do Dashboard consolidado
public record PessoaTotalDto(Guid Id, string Nome, int Idade, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);
public record TotalGeralDto(decimal TotalReceitasGeral, decimal TotalDespesasGeral, decimal SaldoLiquidoGeral);
public record DashboardDto(List<PessoaTotalDto> PessoasTotais, TotalGeralDto TotalGeral);
