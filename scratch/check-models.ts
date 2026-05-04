import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) {
        console.error("No API key found in .env");
        return;
    }
    console.log("Testing with key:", key.substring(0, 10) + "...");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        console.log("Available models:", data.models?.map(m => m.name));
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}
run();
