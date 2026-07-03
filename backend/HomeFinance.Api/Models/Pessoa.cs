namespace HomeFinance.Api.Models;

/// <summary>
/// Representa uma pessoa cadastrada no sistema.
/// </summary>
public class Pessoa
{
    // Identificador único da pessoa, gerado automaticamente
    public Guid Id { get; set; } = Guid.NewGuid();

    // Nome da pessoa
    public string Nome { get; set; } = string.Empty;

    // Idade da pessoa (utilizada para validar transações)
    public int Idade { get; set; }

    // Propriedade de navegação para as transações vinculadas a esta pessoa (carregadas via EF Core)
    public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
}
