import 'react-loading-skeleton/dist/skeleton.css'

import { Bot, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { Button } from '@/components/shared/Button'
import { useConversation } from '@/hooks/useConversation'
import { useInsight } from '@/hooks/useInsight'
import { Content } from '../Insights/Content'
import { Error } from '../Insights/Error'

interface AIInsightCardProps {
  simulationId: string
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId)
  const {
    getMessages,
    sendMessage,
    isLoading: isChatLoading,
    error: chatError,
  } = useConversation(simulationId)
  type ChatMessage = { role: 'user' | 'assistant'; message: string; createdAt: string }

  const [text, setText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(() => getMessages() as ChatMessage[])
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!listRef.current) return
    // Auto-scroll to bottom when messages change
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages.length, isChatLoading])

  const handleSend = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    const now = new Date().toISOString()
    const userMessage: ChatMessage = { role: 'user', message: trimmed, createdAt: now }

    // Optimistically show the user's message and clear input immediately
    setMessages((prev) => [...prev, userMessage])
    setText('')

    try {
      await sendMessage(trimmed)
      // sync with persisted conversation
      setMessages(getMessages())
    } catch {
      setMessages(getMessages())
    }
  }
  console.log(insight)

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}
      {!isLoading && error && (
        <Error
          simulationId={simulationId}
          message={error}
          onRetry={() => {
            fetchInsight(simulationId)
          }}
        />
      )}
      {!isLoading && insight && !error && <Content insight={insight} />}

      {/* Conversation UI */}
      <div className="mt-6 flex h-[240px] flex-col gap-2 sm:h-[280px] sm:gap-3 lg:h-[360px]">
        <div
          ref={listRef}
          className="border-border bg-background flex-1 overflow-auto rounded-md border p-2 sm:p-3 lg:p-4"
        >
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-xs sm:text-sm">
              Ainda não há perguntas. Pergunte algo sobre a sua simulação.
            </p>
          ) : (
            messages.map((m, idx) =>
              m.role === 'user' ? (
                <div
                  key={`${m.createdAt}-${idx}`}
                  className="mb-2 flex items-start justify-end gap-2 sm:mb-3 sm:gap-3"
                >
                  <div className="max-w-[78%] text-right sm:max-w-[85%]">
                    <div className="bg-primary text-primary-foreground inline-block rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                      <p className="text-xs whitespace-pre-wrap sm:text-sm">{m.message}</p>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-[10px] sm:mt-1 sm:text-xs">
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full sm:h-8 sm:w-8">
                      <User
                        size={14}
                        className="text-primary-foreground sm:scale-100"
                        style={{ width: '14px', height: '14px' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={`${m.createdAt}-${idx}`}
                  className="mb-2 flex items-start gap-2 sm:mb-3 sm:gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="bg-secondary-button flex h-6 w-6 items-center justify-center rounded-full sm:h-8 sm:w-8">
                      <Bot
                        size={14}
                        className="text-foreground sm:scale-100"
                        style={{ width: '14px', height: '14px' }}
                      />
                    </div>
                  </div>
                  <div className="max-w-[78%] sm:max-w-[85%]">
                    <div className="bg-surface text-foreground inline-block rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                      <p className="text-xs whitespace-pre-wrap sm:text-sm">{m.message}</p>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-[10px] sm:mt-1 sm:text-xs">
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ),
            )
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            className="border-border bg-card min-h-[40px] flex-1 resize-none rounded-xl border px-3 py-2 text-xs focus:outline-none sm:min-h-[44px] sm:px-4 sm:text-sm"
            placeholder="Pergunte sobre sua simulação..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend(text)
              }
            }}
          />
          <Button
            variant="primary"
            onClick={() => {
              void handleSend(text)
            }}
            disabled={isChatLoading}
            className="w-full sm:w-auto"
          >
            {isChatLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>

        {chatError && <p className="text-destructive text-sm">{chatError}</p>}
      </div>
    </div>
  )
}
