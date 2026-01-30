'use client'

import React from "react"

import { useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import SidebarNav from '@/components/sidebar-nav'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface AppSidebarProps {
  children: React.ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  const [open, setOpen] = useState(true)
  const isMobile = useIsMobile()

  return (
    <SidebarProvider defaultOpen={!isMobile} open={open} onOpenChange={setOpen}>
      <div className="flex h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Sidebar */}
        <Sidebar className="border-r border-orange-900/20 bg-gradient-to-b from-slate-950 to-slate-900/50">
          <SidebarContent className="flex flex-col h-full">
            <SidebarNav isCollapsed={!open} />
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center gap-4 p-4 border-b border-orange-900/20 bg-slate-900/50">
              <SidebarTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(!open)}
                >
                  {open ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </SidebarTrigger>
              <div className="flex-1" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
