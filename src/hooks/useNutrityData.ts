import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, serverTimestamp, addDoc } from 'firebase/firestore';
import { dbService, FoodItem, Micronutrient, Course } from '../lib/db-service';

export function useNutrityData(user: any) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [measurements, setMeasurements] = useState<any[]>([]);
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const organizationId = user?.profile?.organizationId;

    // 1. Cargar Datos de Catálogo (Supabase)
    const loadCatalogs = useCallback(async () => {
        try {
            const [foodData, microData, courseData] = await Promise.all([
                dbService.getFoods(organizationId),
                dbService.getMicronutrients(organizationId),
                dbService.getCourses(organizationId)
            ]);
            setFoods(foodData);
            setMicros(microData);
            setCourses(courseData);
        } catch (err) {
            console.error('Error loading catalogs:', err);
        }
    }, [organizationId]);

    // 2. Suscribirse a Datos de Usuario (Firestore - Realtime)
    useEffect(() => {
        if (!user?.uid) return;

        // Filtro de Organización para Firestore
        const baseFilter = organizationId 
            ? where('organizationId', '==', organizationId) 
            : where('userId', '==', user.uid); // Fallback to userId if no org (legacy)

        const mQuery = query(collection(db, 'measurements'), baseFilter);
        const aQuery = query(collection(db, 'appointments'), baseFilter);

        const mUnsub = onSnapshot(mQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeasurements(data);
        });

        const aUnsub = onSnapshot(aQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(data);
        });

        loadCatalogs().finally(() => setLoading(false));

        return () => { mUnsub(); aUnsub(); };
    }, [user?.uid, organizationId, loadCatalogs]);

    // 3. Acciones de Escritura Protegidas
    const addAppointment = async (appt: any) => {
        if (!user?.uid) throw new Error('Auth required');
        return addDoc(collection(db, 'appointments'), {
            ...appt,
            userId: user.uid,
            organizationId,
            timestamp: serverTimestamp()
        });
    };

    const addMeasurement = async (measure: any) => {
        if (!user?.uid) throw new Error('Auth required');
        return addDoc(collection(db, 'measurements'), {
            ...measure,
            userId: user.uid,
            organizationId,
            timestamp: serverTimestamp()
        });
    };

    return {
        appointments,
        measurements,
        foods,
        micros,
        courses,
        loading,
        addAppointment,
        addMeasurement,
        refreshCatalogs: loadCatalogs
    };
}
