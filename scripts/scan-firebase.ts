import 'dotenv/config'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

async function test(projectId: string) {
    console.log(`🔍 Probando proyecto: ${projectId}...`);
    const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId: projectId,
    };

    try {
        const app = initializeApp(firebaseConfig, projectId);
        const db = getFirestore(app);
        
        const collections = ['users', 'evaluations', 'appointments', 'measurements'];
        for (const col of collections) {
            try {
                const q = query(collection(db, col), limit(1));
                const snapshot = await getDocs(q);
                console.log(`   - ${col}: ${snapshot.size > 0 ? 'CON DATOS' : 'VACÍO'}`);
            } catch (e: any) {
                console.log(`   - ${col}: ERROR (${e.message.substring(0, 50)}...)`);
            }
        }
    } catch (err: any) {
        console.error(`❌ Error en ${projectId}:`, err.message);
    }
}

async function main() {
    await test('nutrity-e043a');
    await test('vid-a-ecommerce');
    await test('studio-5024866487-2f12a');
}

main();
