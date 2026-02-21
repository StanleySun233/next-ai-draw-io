import { compare } from "bcryptjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { signToken } from "@/lib/auth-utils"
import { getDb } from "@/lib/db"

export async function POST(req: Request) {
    const { username, password } = await req.json()
    if (!username || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const db = getDb()
    const user = db
        .prepare("SELECT id, password FROM users WHERE username = ?")
        .get(username) as { id: number; password: string } | undefined

    if (!user || !(await compare(password, user.password))) {
        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 },
        )
    }

    const configRow = db
        .prepare("SELECT config FROM model_configs WHERE user_id = ?")
        .get(user.id) as { config: string } | undefined

    const token = await signToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    })

    return NextResponse.json({
        username,
        config: configRow ? JSON.parse(configRow.config) : null,
    })
}
