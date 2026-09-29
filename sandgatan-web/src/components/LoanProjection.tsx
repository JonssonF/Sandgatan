import { Stack, Table, Text } from '@mantine/core'
import { formatSek } from '../lib/format'
import { projectLoan } from '../lib/loanMath'
import { MONTH_NAMES_SV } from '../lib/month'

interface LoanProjectionProps {
  start: { year: number; month: number }
  balance: number
  ratePercent: number
  amortization: number
  months?: number
}

/** Upcoming months for a loan: remaining debt, interest and amortization per month. */
export function LoanProjection({ start, balance, ratePercent, amortization, months = 12 }: LoanProjectionProps) {
  const rows = projectLoan(start, balance, ratePercent, amortization, months)
  if (rows.length === 0) return null

  const monthsToPayOff = amortization > 0 ? Math.ceil(balance / amortization) : null
  const yearsToPayOff = monthsToPayOff != null ? monthsToPayOff / 12 : null

  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>Kommande månader</Text>
      <Table fz="xs" verticalSpacing={4} horizontalSpacing="xs" striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Månad</Table.Th>
            <Table.Th ta="right">Skuld</Table.Th>
            <Table.Th ta="right">Ränta</Table.Th>
            <Table.Th ta="right">Att betala</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
          {rows.map((r) => (
            <Table.Tr key={`${r.year}-${r.month}`}>
              <Table.Td>{MONTH_NAMES_SV[r.month - 1].slice(0, 3)} {r.year}</Table.Td>
              <Table.Td ta="right">{formatSek(r.balance)}</Table.Td>
              <Table.Td ta="right">{formatSek(r.interest)}</Table.Td>
              <Table.Td ta="right">{formatSek(r.total)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Text size="xs" c="dimmed">
        {yearsToPayOff != null
          ? `Med nuvarande amortering är lånet betalt om ca ${yearsToPayOff < 1 ? `${monthsToPayOff} månader` : `${yearsToPayOff.toLocaleString('sv-SE', { maximumFractionDigits: 1 })} år`}.`
          : 'Ingen amortering angiven – skulden ligger kvar och räntan är densamma varje månad.'}
        {' '}Räntan är en uppskattning (skuld × räntesats / 12) och räknas om automatiskt varje ny månad.
      </Text>
    </Stack>
  )
}
