"use client"

import { useCallback, useEffect, useState } from "react"
import { getApiEndpoint } from "@/lib/base-path"
import type { MultiModelConfig } from "@/lib/types/model-config"

interface User {
    username: string
}

export interface UseAuthReturn {
    user: User | null
    isLoading: boolean
    login: (
        username: string,
        password: string,
    ) => Promise<{ config: MultiModelConfig | null }>
    register: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch(getApiEndpoint("/api/auth/me"))
            .then((r) => (r.ok ? r.json() : null))
            .then((data) =>
                setUser(data?.user ? { username: data.user.username } : null),
            )
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false))
    }, [])

    const login = useCallback(async (username: string, password: string) => {
        const res = await fetch(getApiEndpoint("/api/auth/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || "Login failed")
        }
        const data = await res.json()
        setUser({ username: data.username })
        return { config: data.config as MultiModelConfig | null }
    }, [])

    const register = useCallback(async (username: string, password: string) => {
        const res = await fetch(getApiEndpoint("/api/auth/register"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || "Registration failed")
        }
        const data = await res.json()
        setUser({ username: data.username })
    }, [])

    const logout = useCallback(async () => {
        await fetch(getApiEndpoint("/api/auth/logout"), { method: "POST" })
        setUser(null)
    }, [])

    return { user, isLoading, login, register, logout }
}
