import { Eye, Goal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'

const formatCurrency = (value: string) => {
  const number = Number(value.toString().replace(/\D/g, '')) / 100
  if (Number.isNaN(number)) return 'R$ 0,00'
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const formatDate = (value?: string) => {
  if (!value) return 'Data não disponível'
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function SimulationHistoryPage() {
  const { getAllFormData, deleteSimulation } = useSimulationStorage()
  const [history, setHistory] = useState<SimulationRecord[]>(() => getAllFormData())
  const navigate = useNavigate()

  const handleDelete = (id: string) => {
    deleteSimulation(id)
    setHistory(getAllFormData())
  }

  const handleViewDetails = (id: string) => {
    navigate(`/resultado/${id}`)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de simulações"
        subtitle="Acompanhe o histórico das suas metas financeiras e volte aos resultados sempre que precisar."
      />

      {history.length === 0 ? (
        <div className="border-border bg-surface space-y-6 rounded-3xl border px-6 py-12 text-center shadow-sm">
          <p className="text-foreground text-lg font-semibold">Nenhuma simulação encontrada.</p>
          <p className="text-muted-foreground">
            Crie sua primeira simulação para salvar o plano e gerar insights automáticos.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Nova Simulação
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const monthlySavings = calcMonthlySavings(record)

            return (
              <article
                key={record.id}
                className="border-border bg-surface rounded-[2rem] border shadow-sm"
              >
                {/* Mobile Layout */}
                <div className="block p-6 lg:hidden">
                  <div className="flex flex-col gap-4">
                    <Goal className="text-primary h-10 w-10" />
                    <div>
                      <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                        Meta
                      </p>
                      <h2 className="text-foreground text-2xl font-semibold">{record.goalName}</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="border-border bg-background rounded-3xl border p-4">
                        <p className="text-muted-foreground text-xs uppercase">Custo da meta</p>
                        <p className="text-foreground mt-2 text-lg font-semibold">
                          {formatCurrency(record.goalAmount)}
                        </p>
                      </div>
                      <div className="border-border bg-background rounded-3xl border p-4">
                        <p className="text-muted-foreground text-xs uppercase">Prazo</p>
                        <p className="text-foreground mt-2 text-lg font-semibold">
                          {record.goalDeadline} meses
                        </p>
                      </div>
                      <div className="border-border bg-background rounded-3xl border p-4 sm:col-span-2">
                        <p className="text-muted-foreground text-xs uppercase">Economia mensal</p>
                        <p className="text-foreground mt-2 text-lg font-semibold">
                          {monthlySavings.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        icon={Eye}
                        onClick={() => handleViewDetails(record.id)}
                      >
                        Ver detalhes
                      </Button>
                      <Button
                        variant="secondary"
                        icon={Trash2}
                        onClick={() => handleDelete(record.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4 lg:px-6 lg:py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <Goal className="text-background h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-foreground truncate text-sm font-semibold">
                        {record.goalName}
                      </h2>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-3 text-center">
                    <p className="text-muted-foreground text-xs text-nowrap uppercase">
                      Custo da meta
                    </p>
                    <p className="text-foreground text-xs font-semibold">
                      {formatCurrency(record.goalAmount)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 px-3 text-center">
                    <p className="text-muted-foreground text-xs text-nowrap uppercase">Prazo</p>
                    <p className="text-foreground text-xs font-semibold">
                      {record.goalDeadline} meses
                    </p>
                  </div>

                  <div className="flex-shrink-0 px-3 text-center">
                    <p className="text-muted-foreground text-xs text-nowrap uppercase">
                      Economia mensal
                    </p>
                    <p className="text-foreground text-xs font-semibold">
                      R${' '}
                      {monthlySavings.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-4">
                    <Button variant="ghost" icon={Eye} onClick={() => handleViewDetails(record.id)}>
                      <span className="hidden sm:inline">Ver detalhes</span>
                    </Button>
                    <Button
                      variant="secondary"
                      icon={Trash2}
                      onClick={() => handleDelete(record.id)}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
