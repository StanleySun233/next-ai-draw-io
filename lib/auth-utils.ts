import { jwtVerify, SignJWT } from "jose"
import type { NextRequest } from "next/server"

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "dev-secret-change-in-production",
)

export async function signToken(userId: number): Promise<string> {
    return new SignJWT({ sub: String(userId) })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret)
}

export async function verifyToken(req: NextRequest): Promise<number | null> {
    const token = req.cookies.get("auth_token")?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, secret)
        return Number(payload.sub)
    } catch {
        return null
    }
}
