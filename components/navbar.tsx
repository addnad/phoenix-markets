'use client'

import { useAccount, useChainId, useSwitchChain, useDisconnect, useConnect } from 'wagmi'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Lock, Zap, LogOut, Wallet, Flame, Menu, Plus } from 'lucide-react'
import { sepolia, arbitrumSepolia } from 'wagmi/chains'
import { useState } from 'react'
import CreateMarketModal from './create-market-modal'

export default function Navbar() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentChain = chainId === arbitrumSepolia.id ? arbitrumSepolia : sepolia

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/top-markets', label: 'Top Markets' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-900/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg text-foreground">Phoenix Markets</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Powered by Fhenix</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Create Market Button */}
            {isConnected && (
              <CreateMarketModal />
            )}

            {/* Chain Switcher */}
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent hidden sm:flex"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentChain.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => switchChain({ chainId: sepolia.id })}>
                    <span className={chainId === sepolia.id ? 'font-semibold text-orange-500' : ''}>
                      {sepolia.name}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchChain({ chainId: arbitrumSepolia.id })}>
                    <span className={chainId === arbitrumSepolia.id ? 'font-semibold text-orange-500' : ''}>
                      {arbitrumSepolia.name}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Wallet Connect/Disconnect */}
            {isConnected && address ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    size="sm"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">{formatAddress(address)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {formatAddress(address)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => disconnect()} className="gap-2 text-red-500">
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleConnect}
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                size="sm"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <DropdownMenuItem>
                        {link.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
