import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ScrollToTop } from './components/ScrollToTop'
import { DashboardPage } from './pages/DashboardPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { IncomesPage } from './pages/IncomesPage'
import { SavingsPage } from './pages/SavingsPage'
import { PurchasesPage } from './pages/PurchasesPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/inkomster" element={<IncomesPage />} />
        <Route path="/utgifter" element={<ExpensesPage />} />
        <Route path="/vardagskop" element={<PurchasesPage />} />
        <Route path="/sparande" element={<SavingsPage />} />
        <Route path="/installningar" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  )
}
