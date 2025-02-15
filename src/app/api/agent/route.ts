import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "../../../lib/agent";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await runAgent(message);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Agent error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Agent configuration error. Please contact support." },
          { status: 500 }
        );
      }

      if (error.message.includes("Authentication failed")) {
        return NextResponse.json(
          { error: "Agent authentication error. Please try again later." },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
