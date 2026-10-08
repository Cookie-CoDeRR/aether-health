import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side Firebase ID token verification route.
 * Follows Firebase Auth server verification standards without storing secrets in the repository.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string" || idToken.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid idToken." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.FIREBASE_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Server Firebase configuration missing (API key not configured).",
        },
        { status: 503 }
      );
    }

    // Server-side verification via Google Identity Toolkit API per Firebase documentation
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));
      const errMsg =
        errData?.error?.message || "Invalid or expired Firebase ID token.";
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 401 }
      );
    }

    const data = await verifyRes.json();
    const user = data.users?.[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User identity not found in token." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      uid: user.localId,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error during token verification.",
      },
      { status: 500 }
    );
  }
}
