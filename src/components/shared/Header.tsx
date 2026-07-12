import { Clock, Moon, Sun, TrendingUp, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useTheme } from '@/hooks/useTheme'

import { Button } from './Button'
import { Divider } from './Divider'

export function Header() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-(--border) px-6 py-3">
      <nav className="flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-full">
            <Wallet size={20} className="text-primary-foreground" />
          </div>
          <span className="text-lg">
            <span className="text-muted-foreground font-medium">Planej</span>
            <span className="font-extrabold">.ai</span>
          </span>
        </div>
        {/* Actions buttons */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={TrendingUp} onClick={() => navigate('/')}>
            <span className="hidden sm:inline">Nova Simulação</span>
          </Button>
          <Button variant="ghost" icon={Clock} onClick={() => navigate('/historico')}>
            <span className="hidden sm:inline">Histórico</span>
          </Button>
          <Divider orientation="vertical" />
          <Button
            aria-label={`Alternar tema para ${theme === 'light' ? 'dark' : 'light'} `}
            variant="ghost"
            icon={theme === 'light' ? Moon : Sun}
            onClick={toggleTheme}
          ></Button>
        </div>
      </nav>
    </header>
  )
}
