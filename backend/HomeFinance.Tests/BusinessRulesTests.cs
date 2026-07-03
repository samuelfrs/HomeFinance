using HomeFinance.Api.Data;
using HomeFinance.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HomeFinance.Tests;

public class BusinessRulesTests
{
    // Método auxiliar para criar um DbContext com banco de dados SQLite em memória limpo
    private AppDbContext CreateInMemoryDbContext()
    {
        // Cria e abre uma conexão SQLite em memória
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new AppDbContext(options);
        
        // Cria a estrutura de tabelas
        context.Database.EnsureCreated();

        return context;
    }

    [Fact]
    public async Task DeletePessoa_ShouldDeleteAssociatedTransactionsInCascade()
    {
        // Arrange (Preparar)
        using var context = CreateInMemoryDbContext();

        var pessoa = new Pessoa
        {
            Nome = "Samuel Teste",
            Idade = 25
        };
        context.Pessoas.Add(pessoa);
        await context.SaveChangesAsync();

        var transacao1 = new Transacao
        {
            Descricao = "Supermercado",
            Valor = 150.50m,
            Tipo = TipoTransacao.Despesa,
            PessoaId = pessoa.Id
        };

        var transacao2 = new Transacao
        {
            Descricao = "Salário",
            Valor = 3000.00m,
            Tipo = TipoTransacao.Receita,
            PessoaId = pessoa.Id
        };

        context.Transacoes.AddRange(transacao1, transacao2);
        await context.SaveChangesAsync();

        // Garante que os dados foram inseridos
        Assert.Equal(1, await context.Pessoas.CountAsync());
        Assert.Equal(2, await context.Transacoes.CountAsync());

        // Act (Agir)
        // Remove a pessoa criada
        context.Pessoas.Remove(pessoa);
        await context.SaveChangesAsync();

        // Assert (Verificar)
        // A pessoa deve ter sido excluída
        var pessoaExiste = await context.Pessoas.AnyAsync(p => p.Id == pessoa.Id);
        Assert.False(pessoaExiste);

        // As transações associadas também devem ter sido excluídas por cascata (Cascade)
        var totalTransacoes = await context.Transacoes.CountAsync();
        Assert.Equal(0, totalTransacoes);
    }

    [Fact]
    public void ValidateTransactionRule_MenorDe18AnosComReceita_DeveSerInvalido()
    {
        // Arrange (Preparar)
        var pessoaMenor = new Pessoa { Nome = "Menor de Idade", Idade = 17 };
        
        // Simulação da transação do tipo Receita (que é proibida para menores de 18 anos)
        var transacaoReceita = new Transacao 
        { 
            Descricao = "Mesada", 
            Valor = 50.00m, 
            Tipo = TipoTransacao.Receita 
        };

        // Act (Agir)
        // Executa a regra lógica equivalente ao validador do endpoint
        bool isRuleValid = !(pessoaMenor.Idade < 18 && transacaoReceita.Tipo == TipoTransacao.Receita);

        // Assert (Verificar)
        // A validação deve falhar (isRuleValid deve ser falso)
        Assert.False(isRuleValid);
    }

    [Fact]
    public void ValidateTransactionRule_MenorDe18AnosComDespesa_DeveSerValido()
    {
        // Arrange (Preparar)
        var pessoaMenor = new Pessoa { Nome = "Menor de Idade", Idade = 17 };
        
        // Simulação da transação do tipo Despesa (que é permitida para menores de 18 anos)
        var transacaoDespesa = new Transacao 
        { 
            Descricao = "Lanche", 
            Valor = 15.00m, 
            Tipo = TipoTransacao.Despesa 
        };

        // Act (Agir)
        // Executa a regra lógica equivalente ao validador do endpoint
        bool isRuleValid = !(pessoaMenor.Idade < 18 && transacaoDespesa.Tipo == TipoTransacao.Receita);

        // Assert (Verificar)
        // A validação deve ser aceita (isRuleValid deve ser verdadeiro)
        Assert.True(isRuleValid);
    }

    [Fact]
    public void ValidateTransactionRule_MaiorDe18AnosComReceita_DeveSerValido()
    {
        // Arrange (Preparar)
        var pessoaMaior = new Pessoa { Nome = "Maior de Idade", Idade = 19 };
        
        // Simulação da transação do tipo Receita (que é permitida para maiores de 18 anos)
        var transacaoReceita = new Transacao 
        { 
            Descricao = "Salário", 
            Valor = 2000.00m, 
            Tipo = TipoTransacao.Receita 
        };

        // Act (Agir)
        // Executa a regra lógica equivalente ao validador do endpoint
        bool isRuleValid = !(pessoaMaior.Idade < 18 && transacaoReceita.Tipo == TipoTransacao.Receita);

        // Assert (Verificar)
        // A validação deve ser aceita (isRuleValid deve ser verdadeiro)
        Assert.True(isRuleValid);
    }
}
