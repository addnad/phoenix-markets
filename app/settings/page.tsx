'use client'

import { useState } from 'react'
import { useNetwork } from 'wagmi'
import { useAccount, useSwitchChain } from 'wagmi'
import { sepolia, arbitrumSepolia } from 'wagmi/chains'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Moon, Sun, Network, Flame, Save } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  const handleChainSwitch = async (chainId: number) => {
    if (switchChain) {
      try {
        switchChain({ chainId })
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center gap-3 mb-4">
            <Settings className="w-10 h-10 text-orange-500" />
            Settings
          </h1>
          <p className="text-lg text-slate-400">Customize your preferences and network settings</p>
        </div>

        {/* Theme Settings */}
        <Card className="mb-6 p-6 border-orange-900/20 bg-slate-900/50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-blue-400" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
                Theme
              </h2>
              <p className="text-sm text-slate-400">Choose your preferred color scheme</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <Label className="flex items-center gap-3 cursor-pointer flex-1">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span>Light Mode</span>
              </Label>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <Label className="flex items-center gap-3 cursor-pointer flex-1">
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Dark Mode</span>
              </Label>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <Label className="flex items-center gap-3 cursor-pointer flex-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>System Default</span>
              </Label>
              <input
                type="radio"
                name="theme"
                value="system"
                checked={theme === 'system'}
                onChange={() => setTheme('system')}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Network Settings */}
        {isConnected && (
          <Card className="mb-6 p-6 border-orange-900/20 bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-400" />
                Network
              </h2>
              <p className="text-sm text-slate-400">Select your blockchain network</p>
            </div>

            <div className="mt-4 space-y-3">
              {/* Sepolia */}
              <button
                onClick={() => handleChainSwitch(sepolia.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  chain?.id === sepolia.id
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-orange-900/20 bg-slate-800/50 hover:border-orange-500/30'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-white">{sepolia.name}</p>
                  <p className="text-xs text-slate-500">{sepolia.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {chain?.id === sepolia.id && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                      Connected
                    </span>
                  )}
                  {chain?.id !== sepolia.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-900/30 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChainSwitch(sepolia.id)
                      }}
                    >
                      Switch
                    </Button>
                  )}
                </div>
              </button>

              {/* Arbitrum Sepolia */}
              <button
                onClick={() => handleChainSwitch(arbitrumSepolia.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  chain?.id === arbitrumSepolia.id
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-orange-900/20 bg-slate-800/50 hover:border-orange-500/30'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-white">{arbitrumSepolia.name}</p>
                  <p className="text-xs text-slate-500">{arbitrumSepolia.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {chain?.id === arbitrumSepolia.id && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                      Connected
                    </span>
                  )}
                  {chain?.id !== arbitrumSepolia.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-900/30 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChainSwitch(arbitrumSepolia.id)
                      }}
                    >
                      Switch
                    </Button>
                  )}
                </div>
              </button>
            </div>
          </Card>
        )}

        {/* Wallet Info */}
        {isConnected && (
          <Card className="mb-6 p-6 border-orange-900/20 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Wallet Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Connected Address</p>
                <p className="text-sm font-mono text-white break-all">{address}</p>
              </div>
              {chain && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Current Network</p>
                  <p className="text-sm text-white">{chain.name}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Privacy Notice */}
        <Alert className="border-orange-900/20 bg-orange-500/5">
          <Flame className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-200">
            Your privacy is our priority. All predictions and votes are encrypted using Fhenix CoFHE.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-orange-900/30"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
