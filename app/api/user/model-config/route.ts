import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDb } from "@/lib/db"

export async function GET(req: NextRequest) {
    const userId = await verifyToken(req)
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = getDb()
    const row = db
        .prepare("SELECT config FROM model_configs WHERE user_id = ?")
        .get(userId) as { config: string } | undefined

    return NextResponse.json({ config: row ? JSON.parse(row.config) : null })
}

export async function PUT(req: NextRequest) {
    const userId = await verifyToken(req)
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { config } = await req.json()
    const db = getDb()
    db.prepare(`
        INSERT INTO model_configs (user_id, config, updated_at) VALUES (?, ?, unixepoch())
        ON CONFLICT(user_id) DO UPDATE SET config = excluded.config, updated_at = excluded.updated_at
    `).run(userId, JSON.stringify(config))

    return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
    const userId = await verifyToken(req)
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    getDb().prepare("DELETE FROM model_configs WHERE user_id = ?").run(userId)
    return NextResponse.json({ ok: true })
}
