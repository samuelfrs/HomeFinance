using HomeFinance.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeFinance.Api.Data;

/// <summary>
/// Contexto do banco de dados da aplicação para o Entity Framework Core.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Tabela de Pessoas
    public DbSet<Pessoa> Pessoas => Set<Pessoa>();

    // Tabela de Transações
    public DbSet<Transacao> Transacoes => Set<Transacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração da relação 1-para-Muitos entre Pessoa e Transacao
        // Configurando a deleção em cascata (Se uma pessoa for deletada, suas transações são apagadas)
        modelBuilder.Entity<Transacao>()
            .HasOne(t => t.Pessoa)
            .WithMany(p => p.Transacoes)
            .HasForeignKey(t => t.PessoaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Conversão do Enum TipoTransacao para string no banco de dados SQLite para facilitar visualização
        modelBuilder.Entity<Transacao>()
            .Property(t => t.Tipo)
            .HasConversion<string>();
    }
}
