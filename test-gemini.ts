import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
    const key = "AIzaSyDBr0sLaqzL26sLRWvmzKbYutxjn1gEsN8";
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Testing with gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await model.generateContent("Say hi");
        console.log("gemini-1.5-flash WORKED:", res.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash error:", e.message);
    }
}
run();
