import { Alert } from '@mantine/core'
import { IconWifiOff } from '@tabler/icons-react'
import { useBackendHealth } from '../../api/health'

export function BackendOfflineBanner() {
  const { isError } = useBackendHealth()

  if (!isError) return null

  return (
    <Alert
      color="red"
      icon={<IconWifiOff size={20} />}
      title="Ingen kontakt med servern"
      radius={0}
      styles={{ root: { borderRadius: 0 } }}
    >
      Sandgatan kan inte nå backend-servern just nu. Kontrollera att den körs på hemnätverket. Ändringar kan inte
      sparas förrän kontakten är återställd.
    </Alert>
  )
}
