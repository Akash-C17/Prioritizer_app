import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userStory } = await req.json();

    if (!userStory || !userStory.trim()) {
      return NextResponse.json(
        { error: "User story is required" },
        { status: 400 }
      );
    }

    // This would connect to your AI service (OpenAI, Claude, etc.) for constraint extraction
    // For now, returning a simple extraction based on the user story
    // In production, you would call an LLM API here
    
    // Simple constraint extraction - split by sentences and analyze
    const sentences = userStory
      .split(/[.!?\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const constraints = sentences.map((sentence, idx) => {
      // Simple keyword-based categorization
      const lower = sentence.toLowerCase();
      let type = "Requirement";
      
      if (lower.includes("must") || lower.includes("should") || lower.includes("need")) {
        type = "Constraint";
      } else if (lower.includes("can") || lower.includes("may") || lower.includes("want")) {
        type = "Feature";
      } else if (lower.includes("limit") || lower.includes("budget") || lower.includes("time")) {
        type = "Constraint";
      }
      
      return `${type}: ${sentence}`;
    });

    return NextResponse.json({ constraints }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate constraints" },
      { status: 500 }
    );
  }
}