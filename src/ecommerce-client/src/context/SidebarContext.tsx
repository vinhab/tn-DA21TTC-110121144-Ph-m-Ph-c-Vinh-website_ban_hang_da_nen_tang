// src/context/SidebarContext.tsx
'use client'

import React, { createContext, useContext, useState } from 'react'

type SidebarContextType = {
  isExpanded: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setExpanded] = useState(true)

  const toggle = () => setExpanded(prev => !prev)

  return (
    <SidebarContext.Provider value={{ isExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within SidebarProvider')
  return context
}

export default SidebarProvider
