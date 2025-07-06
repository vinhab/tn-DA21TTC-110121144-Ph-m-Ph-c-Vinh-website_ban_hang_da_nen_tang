'use client'

import { useEffect, useState } from 'react'

export interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
}

export function useUserInfo() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user_info')
    if (stored) {
      try {
        const parsed: UserInfo = JSON.parse(stored)
        setUser(parsed)
      } catch {
        setUser(null)
      }
    }
  }, [])

  return user
}
