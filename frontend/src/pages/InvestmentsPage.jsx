import { useState } from 'react'
import { useInvestments } from '../hooks/useInvestments'
import { usePortfolioSummary } from '../hooks/usePortfolioSummary'
import PortfolioDashboard from '../components/investments/PortfolioDashboard'
import InvestmentList from '../components/investments/InvestmentList'
import InvestmentForm from '../components/investments/InvestmentForm'
import InvestmentDetailPanel from '../components/investments/InvestmentDetailPanel'
import ComparisonChart from '../components/investments/ComparisonChart'
import FireIntegrationCard from '../components/investments/FireIntegrationCard'
import Dialog from '../components/ui/dialog'

export default function InvestmentsPage() {
  const {
    investments,
    tags,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addTag,
    removeTag,
    importData,
    exportData,
  } = useInvestments()

  const summary = usePortfolioSummary(investments)

  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState(null)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const handleAdd = () => {
    setEditingInvestment(null)
    setShowForm(true)
  }

  const handleEdit = (inv) => {
    setEditingInvestment(inv)
    setShowForm(true)
  }

  const handleSave = (data) => {
    if (editingInvestment) {
      updateInvestment({ ...data, id: editingInvestment.id })
    } else {
      addInvestment(data)
    }
    setShowForm(false)
    setEditingInvestment(null)
  }

  const handleDelete = (id) => {
    setShowDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteInvestment(showDeleteConfirm)
      if (selectedInvestment?.id === showDeleteConfirm) {
        setSelectedInvestment(null)
      }
      setShowDeleteConfirm(null)
    }
  }

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fire-investments-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result)
          importData(data)
        } catch {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (investments.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center transition-colors duration-300">
        <div className="mb-4 text-5xl opacity-30">📊</div>
        <h2 className="mb-2 text-xl font-semibold text-card-foreground">No Investments Yet</h2>
        <p className="mb-6 max-w-md text-muted-foreground">
          Start tracking your investments to see projections, allocation breakdowns, and how they contribute to your FI/RE goals.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition-colors"
          >
            Add Your First Investment
          </button>
          <button
            onClick={handleImport}
            className="rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
          >
            Import Data
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Dashboard */}
      {investments.length > 0 && (
        <PortfolioDashboard summary={summary} investments={investments} />
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Investments ({investments.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm hover:bg-accent transition-colors"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm hover:bg-accent transition-colors"
          >
            Export
          </button>
          <button
            onClick={handleAdd}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition-colors"
          >
            + Add Investment
          </button>
        </div>
      </div>

      {/* Investment List */}
      <InvestmentList
        investments={investments}
        onSelect={setSelectedInvestment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedId={selectedInvestment?.id}
      />

      {/* Detail Panel */}
      {selectedInvestment && (
        <InvestmentDetailPanel
          investment={selectedInvestment}
          onClose={() => setSelectedInvestment(null)}
        />
      )}

      {/* Comparison Chart */}
      {investments.length >= 2 && (
        <ComparisonChart investments={investments} />
      )}

      {/* FI/RE Integration */}
      {investments.length > 0 && (
        <FireIntegrationCard summary={summary} investments={investments} />
      )}

      {/* Add/Edit Dialog */}
      {showForm && (
        <Dialog onClose={() => { setShowForm(false); setEditingInvestment(null) }}>
          <InvestmentForm
            investment={editingInvestment}
            tags={tags}
            onSave={handleSave}
            onAddTag={addTag}
            onCancel={() => { setShowForm(false); setEditingInvestment(null) }}
          />
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog onClose={() => setShowDeleteConfirm(null)}>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Delete Investment</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to delete this investment? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
