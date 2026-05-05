import 'dotenv/config'
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child } from "firebase/database";

async function testRTDB(projectId: string) {
    console.log(`🔍 Probando RTDB para: ${projectId}...`);
    const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`, // Formato común
        projectId: projectId,
    };

    try {
        const app = initializeApp(firebaseConfig, projectId);
        const db = getDatabase(app);
        
        const snapshot = await get(child(ref(db), '/'));
        if (snapshot.exists()) {
            console.log(`   - RTDB: CON DATOS (${Object.keys(snapshot.val()).join(', ')})`);
        } else {
            console.log(`   - RTDB: VACÍO`);
        }
    } catch (err: any) {
        console.log(`   - RTDB: ERROR (${err.message.substring(0, 50)}...)`);
    }
}

async function main() {
    await testRTDB('nutrity-e043a');
    await testRTDB('studio-5024866487-2f12a');
}

main();
