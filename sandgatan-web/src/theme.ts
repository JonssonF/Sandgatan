import { createTheme, type MantineColorsTuple } from '@mantine/core'

const brand: MantineColorsTuple = [
  '#e9f1fb', '#d0e0f5', '#a3c2ea', '#74a2de', '#4d87d4',
  '#3574cd', '#1f4e8c', '#1a4478', '#153864', '#0f2a4d',
]

export const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand },
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
  // Big, thumb-friendly touch targets throughout — this app lives on a wall tablet and phones.
  components: {
    Button: {
      defaultProps: { size: 'md' },
    },
    ActionIcon: {
      defaultProps: { size: 'lg' },
    },
  },
})
