import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getChatResponse } from '@/services/aiChatService'
import { parseCurrency } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'
import { useCallback, useState } from 'react'

type Message = { role: 'user' | 'assistant'; message: string; createdAt: string }

export const useConversation = (simulationId: string) => {
  const { getFormData, updateSimulation } = useSimulationStorage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMessages = useCallback((): Message[] => {
    const simulation = getFormData(simulationId)
    return simulation?.conversation || []
  }, [getFormData, simulationId])

  const sendMessage = useCallback(
    async (text: string) => {
      setIsLoading(true)
      setError(null)

      const now = new Date().toISOString()
      const userMessage: Message = { role: 'user', message: text, createdAt: now }

      const simulation = getFormData(simulationId)
      if (!simulation) {
        setError('Simulação não encontrada')
        setIsLoading(false)
        return
      }

      const conversation = simulation.conversation
        ? [...simulation.conversation, userMessage]
        : [userMessage]

      // Save user message immediately
      updateSimulation(simulationId, { ...simulation, conversation } as SimulationRecord)

      try {
        // Build a concise context prompt: provide simulation numbers as context
        const monthlySavings = calcMonthlySavings(simulation)
        const monthlySavingsNeeded =
          parseCurrency(simulation.goalAmount) / Number(simulation.goalDeadline || 1)
        const saldo = monthlySavings - monthlySavingsNeeded

        const context = `Dados da simulação:\nRenda: ${simulation.income} \nCustos fixos: ${simulation.expenses} \nDívidas: ${simulation.debts} \nMeta: ${simulation.goalName} \nCusto da meta: ${simulation.goalAmount} \nPrazo (meses): ${simulation.goalDeadline} \nEconomia disponível por mês: ${monthlySavings} \nEconomia necessária por mês: ${monthlySavingsNeeded.toFixed(2)} \nSaldo após reservar para a meta: ${saldo.toFixed(2)}`

        const promptParts: string[] = []
        promptParts.push(
          'Você é um educador financeiro. Use os dados abaixo apenas como contexto e NÃO repita o diagnóstico automático nem retorne JSON.',
        )
        promptParts.push(
          'Responda APENAS à pergunta do usuário, de forma prática, objetiva e acionável, em português.',
        )
        promptParts.push('\n--- Contexto da simulação ---')
        promptParts.push(context)

        if (conversation.length > 0) {
          promptParts.push('\n--- Histórico de conversa (apenas para contexto) ---')
          conversation.forEach((m) => {
            promptParts.push(`${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.message}`)
          })
        }

        promptParts.push('\n--- Pergunta atual ---')
        promptParts.push(text)

        const prompt = promptParts.join('\n')

        const aiText = await getChatResponse(prompt)
        const assistantMessage: Message = {
          role: 'assistant',
          message: aiText,
          createdAt: new Date().toISOString(),
        }

        const newConversation = [...conversation, assistantMessage]
        updateSimulation(simulationId, {
          ...simulation,
          conversation: newConversation,
        } as SimulationRecord)
      } catch (err) {
        setError('Erro ao enviar mensagem. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    },
    [getFormData, updateSimulation, simulationId],
  )

  return { getMessages, sendMessage, isLoading, error }
}
