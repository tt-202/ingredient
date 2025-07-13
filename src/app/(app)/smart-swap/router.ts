import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function GET(req: NextRequest) {
    const ingredient = req.nextUrl.searchParams.get("ingredient");

    if (!ingredient) {
        return NextResponse.json({ error: "Missing ingredient" }, { status: 400 });
    }

    try {
        const prompt = `Suggest 3 healthy, common substitutes for "${ingredient}" in cooking. Return in bullet list.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text || text.trim() === "") {
            return NextResponse.json({ error: "Gemini response missing or empty" }, { status: 500 });
        }

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json({ error: "Gemini API failed" }, { status: 500 });
    }
}
