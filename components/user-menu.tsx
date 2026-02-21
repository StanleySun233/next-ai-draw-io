"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { UserRound } from "lucide-react"
import { useState } from "react"
import type { UseAuthReturn } from "@/hooks/use-auth"
import type { MultiModelConfig } from "@/lib/types/model-config"

interface UserMenuProps {
    auth: UseAuthReturn
    onLoginSuccess: (config: MultiModelConfig) => void
    onLogout?: () => void
}

function AuthDialog({
    auth,
    onLoginSuccess,
    onClose,
}: {
    auth: UseAuthReturn
    onLoginSuccess: (config: MultiModelConfig) => void
    onClose: () => void
}) {
    const [tab, setTab] = useState<"login" | "register">("login")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            if (tab === "login") {
                const { config } = await auth.login(username, password)
                if (config) onLoginSuccess(config)
            } else {
                await auth.register(username, password)
            }
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 w-80">
            <div className="flex gap-4 mb-4">
                {(["login", "register"] as const).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => {
                            setTab(t)
                            setError("")
                        }}
                        className={`text-sm font-medium pb-1 border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
                    >
                        {t === "login" ? "Login" : "Register"}
                    </button>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    className="border rounded px-3 py-2 text-sm bg-background"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                />
                <input
                    type="password"
                    className="border rounded px-3 py-2 text-sm bg-background"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={
                        tab === "login" ? "current-password" : "new-password"
                    }
                />
                {error && <p className="text-destructive text-xs">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground rounded px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                    {loading ? "..." : tab === "login" ? "Login" : "Register"}
                </button>
            </form>
        </div>
    )
}

export function UserMenu({ auth, onLoginSuccess, onLogout }: UserMenuProps) {
    const [open, setOpen] = useState(false)

    if (auth.isLoading) {
        return (
            <div className="h-8 w-8 flex items-center justify-center opacity-40">
                <UserRound className="h-5 w-5" />
            </div>
        )
    }

    if (auth.user) {
        return (
            <div className="relative">
                <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent"
                    title={auth.user.username}
                    onClick={() => setOpen((v) => !v)}
                >
                    <UserRound className="h-5 w-5 text-green-500" />
                </button>
                {open && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpen(false)}
                        />
                        <div className="absolute right-0 top-9 z-50 min-w-[140px] rounded-md border bg-popover p-1 shadow-md">
                            <p className="px-2 py-1.5 text-xs text-muted-foreground">
                                {auth.user.username}
                            </p>
                            <div className="my-1 h-px bg-border" />
                            <button
                                type="button"
                                className="w-full text-left cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-accent"
                                onClick={() => {
                                    auth.logout()
                                    onLogout?.()
                                    setOpen(false)
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent"
                    title="Login"
                >
                    <UserRound className="h-5 w-5 text-muted-foreground" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background shadow-lg">
                    <Dialog.Title className="sr-only">Login</Dialog.Title>
                    <AuthDialog
                        auth={auth}
                        onLoginSuccess={onLoginSuccess}
                        onClose={() => setOpen(false)}
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
