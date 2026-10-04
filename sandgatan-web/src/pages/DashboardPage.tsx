import { Button, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'
import {
  IconCircleCheck,
  IconCoin,
  IconInfoCircle,
  IconPigMoney,
  IconReceipt2,
  IconReceiptOff,
  IconReportMoney,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useBudgetSummary } from '../api/budget'
import { CopyToNextMonthButton } from '../components/CopyToNextMonthButton'
import { CompactOverview } from '../components/CompactOverview'
import { DistributionBar } from '../components/DistributionBar'
import { ExpensesByCategoryChart } from '../components/ExpensesByCategoryChart'
import { LoanCard } from '../components/LoanCard'
import { PaydayCountdown } from '../components/PaydayCountdown'
import { PurchaseModal } from '../components/PurchaseModal'
import { SpendingCard } from '../components/SpendingCard'
import { SummaryCard } from '../components/SummaryCard'
import { useBudgetPeriod } from '../context/BudgetPeriodContext'
import { formatSek } from '../lib/format'

/** Common rule of thumb: save at least 10% of household income. */
const RECOMMENDED_SAVINGS_RATE = 10

export function DashboardPage() {
  const { year, month } = useBudgetPeriod()
  const { data, isLoading } = useBudgetSummary(year, month)
  const navigate = useNavigate()
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Title order={2}>Översikt</Title>
          <PaydayCountdown />
        </Stack>
        <Group gap="sm">
          <Button leftSection={<IconShoppingCart size={18} />} onClick={() => setPurchaseOpen(true)}>
            Köp
          </Button>
          <Button variant="light" leftSection={<IconCoin size={18} />} onClick={() => navigate('/inkomster', { state: { openAdd: true } })}>
            Lägg till inkomst
          </Button>
          <Button variant="light" leftSection={<IconReceipt2 size={18} />} onClick={() => navigate('/utgifter', { state: { openAdd: true } })}>
            Lägg till utgift
          </Button>
          <Button variant="light" leftSection={<IconPigMoney size={18} />} onClick={() => navigate('/sparande', { state: { openAdd: true } })}>
            Lägg till sparande
          </Button>
          <CopyToNextMonthButton variant="default" />
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
            <SummaryCard
              label="Totala utgifter"
              amount={data.totalExpenses}
              icon={IconReceipt2}
              color="red"
              hint={data.plannedPurchases > 0 ? `inkl. vardagsköp ${formatSek(data.plannedPurchases)}` : undefined}
            />
            <SummaryCard label="Sparande" amount={data.totalSavings} icon={IconPigMoney} color="grape" />
            <SummaryCard label="Kvar efter utgifter" amount={data.remainingAfterExpenses} icon={IconWallet} color="brand" emphasis />
            <SummaryCard label="Kvar efter sparande" amount={data.remainingAfterSavings} icon={IconReportMoney} color="brand" emphasis />
            {data.totalLoans > 0 && (
              <LoanCard
                total={data.totalLoans}
                interest={data.totalLoanInterest}
                amortization={data.totalLoanAmortization}
                balance={data.totalLoanBalance}
              />
            )}
          </SimpleGrid>

          <SpendingCard year={year} month={month} showRecent showPayday={false} />

          <DistributionBar
            fixed={data.totalFixedExpenses}
            variable={data.totalVariableExpenses}
            purchases={data.plannedPurchases}
            savings={data.totalSavings}
          />

          <ExpensesByCategoryChart year={year} month={month} />

          <Stack gap={6}>
            <Group gap="xl">
              <Text size="sm" c="dimmed">Sparkvot: <b>{data.savingsRatePercent}%</b> av inkomsten</Text>
              <Text size="sm" c="dimmed">Utgiftskvot: <b>{data.expenseRatePercent}%</b> av inkomsten</Text>
            </Group>
            <RecommendedSavings income={data.totalIncome} savings={data.totalSavings} />
          </Stack>

          <Title order={3}>Alla poster</Title>
          <CompactOverview year={year} month={month} />
        </>
      )}

      <PurchaseModal opened={purchaseOpen} onClose={() => setPurchaseOpen(false)} />
    </Stack>
  )
}

function RecommendedSavings({ income, savings }: { income: number; savings: number }) {
  if (income <= 0) return null
  const recommended = Math.round((income * RECOMMENDED_SAVINGS_RATE) / 100)
  const reached = savings >= recommended

  return (
    <Group gap="xl" wrap="wrap">
      <Text size="sm" c="dimmed">
        Rekommenderad sparkvot: <b>{RECOMMENDED_SAVINGS_RATE}%</b> = <b>{formatSek(recommended)}</b> per månad
      </Text>
      <Group gap={4} wrap="nowrap">
        {reached
          ? <IconCircleCheck size={16} color="var(--mantine-color-teal-6)" aria-hidden />
          : <IconInfoCircle size={16} color="var(--mantine-color-dimmed)" aria-hidden />}
        <Text size="sm" c="dimmed">
          {reached
            ? <>Ni når rekommendationen{savings > recommended && <> med <b>{formatSek(savings - recommended)}</b> över</>}</>
            : <><b>{formatSek(recommended - savings)}</b> kvar till {RECOMMENDED_SAVINGS_RATE}%</>}
        </Text>
      </Group>
    </Group>
  )
}
