import { ActionIcon, AppShell, Burger, Group, NavLink, ScrollArea, Text, useMantineColorScheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChartPie,
  IconCoin,
  IconLayoutDashboard,
  IconMoon,
  IconPigMoney,
  IconReceipt2,
  IconSettings,
  IconSun,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { MonthSwitcher } from '../MonthSwitcher'
import { BackendOfflineBanner } from './BackendOfflineBanner'

const NAV_ITEMS = [
  { to: '/', label: 'Översikt', icon: IconLayoutDashboard },
  { to: '/inkomster', label: 'Inkomster', icon: IconCoin },
  { to: '/utgifter', label: 'Utgifter', icon: IconReceipt2 },
  { to: '/sparande', label: 'Sparande', icon: IconPigMoney },
  { to: '/installningar', label: 'Inställningar', icon: IconSettings },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const [navOpened, { toggle: toggleNav }] = useDisclosure(false)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const location = useLocation()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !navOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={navOpened} onClick={toggleNav} hiddenFrom="sm" size="sm" />
            <IconChartPie size={26} color="var(--mantine-color-brand-6)" />
            <Text fw={700} size="lg">Sandgatan</Text>
          </Group>
          <Group gap="sm">
            <MonthSwitcher />
            <ActionIcon
              variant="subtle"
              aria-label="Växla tema"
              onClick={() => toggleColorScheme()}
            >
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <ScrollArea>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              component={RouterNavLink}
              to={item.to}
              label={item.label}
              leftSection={<item.icon size={20} />}
              active={location.pathname === item.to}
              onClick={() => navOpened && toggleNav()}
              mb={4}
            />
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <BackendOfflineBanner />
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
