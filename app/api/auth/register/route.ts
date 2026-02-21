import { hash } from "bcryptjs"
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
    const existing = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(username)
    if (existing) {
        return NextResponse.json({ error: "Username taken" }, { status: 409 })
    }

    const hashed = await hash(password, 10)
    const result = db
        .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
        .run(username, hashed)
    const userId = result.lastInsertRowid as number

    const token = await signToken(userId)
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    })

    return NextResponse.json({ username })
}
