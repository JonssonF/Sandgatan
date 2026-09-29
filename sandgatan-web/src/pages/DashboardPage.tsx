import { Button, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import {
  IconCoin,
  IconPigMoney,
  IconReceipt2,
  IconReceiptOff,
  IconReportMoney,
  IconWallet,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useBudgetSummary } from '../api/budget'
import { CompactOverview } from '../components/CompactOverview'
import { DistributionBar } from '../components/DistributionBar'
import { LoanCard } from '../components/LoanCard'
import { SummaryCard } from '../components/SummaryCard'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'

export function DashboardPage() {
  const { year, month } = useBudgetPeriod()
  const { data, isLoading } = useBudgetSummary(year, month)
  const navigate = useNavigate()

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>Översikt</Title>
        <Group gap="sm">
          <Button variant="light" leftSection={<IconCoin size={18} />} onClick={() => navigate('/inkomster', { state: { openAdd: true } })}>
            Lägg till inkomst
          </Button>
          <Button variant="light" leftSection={<IconReceipt2 size={18} />} onClick={() => navigate('/utgifter', { state: { openAdd: true } })}>
            Lägg till utgift
          </Button>
          <Button variant="light" leftSection={<IconPigMoney size={18} />} onClick={() => navigate('/sparande', { state: { openAdd: true } })}>
            Lägg till sparande
          </Button>
        </Group>
      </Group>

      {isLoading || !data ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
            <SummaryCard label="Total inkomst" amount={data.totalIncome} icon={IconCoin} color="teal" emphasis />
            <SummaryCard label="Fasta utgifter" amount={data.totalFixedExpenses} icon={IconReceipt2} color="blue" />
            <SummaryCard label="Rörliga utgifter" amount={data.totalVariableExpenses} icon={IconReceiptOff} color="orange" />
            <SummaryCard label="Totala utgifter" amount={data.totalExpenses} icon={IconReceipt2} color="red" />
            <SummaryCard label="Sparande" amount={data.totalSavings} icon={IconPigMoney} color="grape" />
            <SummaryCard label="Kvar efter utgifter" amount={data.remainingAfterExpenses} icon={IconWallet} color="brand" emphasis />
            <SummaryCard label="Kvar efter sparande" amount={data.remainingAfterSavings} icon={IconReportMoney} color="brand" emphasis />
            {data.totalLoans > 0 && (
              <LoanCard total={data.totalLoans} interest={data.totalLoanInterest} amortization={data.totalLoanAmortization} />
            )}
          </SimpleGrid>

          <DistributionBar fixed={data.totalFixedExpenses} variable={data.totalVariableExpenses} savings={data.totalSavings} />

          <Group gap="xl">
            <Text size="sm" c="dimmed">Sparkvot: <b>{data.savingsRatePercent}%</b> av inkomsten</Text>
            <Text size="sm" c="dimmed">Utgiftskvot: <b>{data.expenseRatePercent}%</b> av inkomsten</Text>
          </Group>

          <Title order={3}>Alla poster</Title>
          <CompactOverview year={year} month={month} />
        </>
      )}
    </Stack>
  )
}
