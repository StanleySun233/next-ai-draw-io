import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
    const cookieStore = await cookies()
    cookieStore.set("auth_token", "", { maxAge: 0, path: "/" })
    return NextResponse.json({ ok: true })
}
