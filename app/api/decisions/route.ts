import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Would fetch from database
    const decisions = [];
    return NextResponse.json({ decisions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, type, data } = await req.json();

    if (!projectId || !type) {
      return NextResponse.json(
        { error: "projectId and type are required" },
        { status: 400 }
      );
    }

    // Would save to database
    const decision = {
      id: Date.now(),
      projectId,
      type,
      data,
      timestamp: new Date(),
    };

    return NextResponse.json({ decision }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save decision" },
      { status: 500 }
    );
  }
}
