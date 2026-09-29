namespace Sandgatan.Domain.Entities;

/// <summary>
/// Marks a month whose recurring entries have been carried over from the previous month.
/// Stops the automatic carry-over from re-adding entries the user later deleted.
/// </summary>
public class InitializedMonth
{
    public int Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime InitializedAt { get; set; }
}
