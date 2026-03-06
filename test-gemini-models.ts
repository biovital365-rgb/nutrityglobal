import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
    const key = "AIzaSyDBr0sLaqzL26sLRWvmzKbYutxjn1gEsN8";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data.models?.map(m => m.name));
}
run();
