import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import DarkModeToggle from './components/ui/DarkModeToggle'
import FireCalculator from './pages/FireCalculator'
import InvestmentsPage from './pages/InvestmentsPage'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">FI/RE Dashboard</h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <Tabs defaultValue="calculator">
          <TabsList className="mb-6">
            <TabsTrigger value="calculator">FI/RE Calculator</TabsTrigger>
            <TabsTrigger value="investments">My Investments</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <FireCalculator />
          </TabsContent>
          <TabsContent value="investments">
            <InvestmentsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
