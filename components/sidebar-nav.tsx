'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Trophy, 
  User, 
  BarChart3, 
  Settings,
  Flame
} from 'lucide-react'

export interface SidebarNavProps {
  isCollapsed: boolean
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname()
  const { toggleSidebar, isMobile } = useSidebar()

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      description: 'Your predictions & markets'
    },
    {
      href: '/top-markets',
      label: 'Top Predictions',
      icon: Trophy,
      description: 'Most popular markets'
    },
    {
      href: '/profile',
      label: 'My Profile',
      icon: User,
      description: 'Your stats & activity'
    },
    {
      href: '/leaderboard',
      label: 'Leaderboard',
      icon: BarChart3,
      description: 'Top creators & voters'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      description: 'Preferences & chains'
    }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="space-y-1 py-4">
      {/* Phoenix Logo/Branding */}
      <div className={cn(
        "flex items-center px-4 mb-6 transition-all duration-300",
        isCollapsed && "justify-center"
      )}>
        <div className="relative">
          <div className="animate-pulse">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="absolute inset-0 bg-orange-500/20 blur-md rounded-full animate-pulse" />
        </div>
        {!isCollapsed && (
          <span className="ml-2 text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Phoenix
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium',
                active
                  ? 'text-white bg-slate-800/50 border-l-2 border-orange-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900/30',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Glow effect for active */}
              {active && (
                <div className="absolute inset-0 bg-orange-500/10 rounded-lg blur animate-pulse" />
              )}
              
              {/* Icon */}
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-all duration-300",
                active && "text-orange-500 group-hover:drop-shadow-lg group-hover:drop-shadow-orange-500/50"
              )} />

              {/* Label (hidden when collapsed) */}
              {!isCollapsed && (
                <span className="transition-opacity duration-300">{item.label}</span>
              )}

              {/* Hover indicator for collapsed state */}
              {isCollapsed && active && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-l" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
