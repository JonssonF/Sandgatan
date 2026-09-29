namespace Sandgatan.Application.Common;

public static class MonthMath
{
    public static (int Year, int Month) Next(int year, int month) =>
        month == 12 ? (year + 1, 1) : (year, month + 1);

    public static (int Year, int Month) Previous(int year, int month) =>
        month == 1 ? (year - 1, 12) : (year, month - 1);
}
