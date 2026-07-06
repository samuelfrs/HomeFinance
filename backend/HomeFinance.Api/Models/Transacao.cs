using System.Text.Json.Serialization;

namespace HomeFinance.Api.Models;

/// <summary>
/// Representa o tipo de transação (Despesa ou Receita).
/// Mapeado como string para melhor leitura no JSON e banco de dados.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TipoTransacao
{
    Despesa,
    Receita
}

/// <summary>
/// Representa uma transação financeira associada a uma pessoa.
/// </summary>
public class Transacao
{
    // Identificador único da transação, gerado automaticamente
    public Guid Id { get; set; } = Guid.NewGuid();

    // Descrição da transação (ex: Mercado, Salário)
    public string Descricao { get; set; } = string.Empty;

    // Valor financeiro da transação
    public decimal Valor { get; set; }

    // Tipo de transação (Despesa ou Receita)
    public TipoTransacao Tipo { get; set; }

    // Data em que a transação foi realizada (selecionada pelo usuário)
    public DateTime Data { get; set; }

    // Identificador da pessoa associada
    public Guid PessoaId { get; set; }

    // Propriedade de navegação para o objeto Pessoa
    [JsonIgnore] // Evita problemas de referência cíclica na serialização JSON
    public Pessoa? Pessoa { get; set; }
}
