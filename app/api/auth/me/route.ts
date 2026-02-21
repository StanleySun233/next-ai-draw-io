import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDb } from "@/lib/db"

export async function GET(req: NextRequest) {
    const userId = await verifyToken(req)
    if (!userId) return NextResponse.json({ user: null })

    const db = getDb()
    const user = db
        .prepare("SELECT username FROM users WHERE id = ?")
        .get(userId) as { username: string } | undefined

    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user: { username: user.username } })
}
