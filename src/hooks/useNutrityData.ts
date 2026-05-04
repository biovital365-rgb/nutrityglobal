import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, serverTimestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { dbService, FoodItem, Micronutrient, Course } from '../lib/db-service';

// Acepta uid y organizationId por separado para compatibilidad con NutrityDashboard
export function useNutrityData(uid: string | undefined, organizationId: string | undefined) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [measurements, setMeasurements] = useState<any[]>([]);
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

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
        if (!uid) return;

        const baseFilter = organizationId
            ? where('organizationId', '==', organizationId)
            : where('userId', '==', uid);

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

        loadCatalogs().finally(() => setIsDataLoading(false));

        return () => { mUnsub(); aUnsub(); };
    }, [uid, organizationId, loadCatalogs]);

    // 3. Acciones de Escritura Protegidas (nombres alineados con Dashboard)
    const saveAppointment = async (appt: any) => {
        if (!uid) throw new Error('Auth required');
        return addDoc(collection(db, 'appointments'), {
            ...appt,
            userId: uid,
            organizationId,
            timestamp: serverTimestamp()
        });
    };

    const saveMeasurement = async (measure: any) => {
        if (!uid) throw new Error('Auth required');
        return addDoc(collection(db, 'measurements'), {
            ...measure,
            userId: uid,
            organizationId,
            timestamp: serverTimestamp()
        });
    };

    const updateAppointment = async (id: string, updates: any) => {
        if (!uid) throw new Error('Auth required');
        const docRef = doc(db, 'appointments', id);
        return updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    };

    const deleteAppointment = async (id: string) => {
        if (!uid) throw new Error('Auth required');
        const docRef = doc(db, 'appointments', id);
        return deleteDoc(docRef);
    };

    return {
        appointments,
        measurements,
        foods,
        micros,
        courses,
        isDataLoading,
        saveAppointment,
        saveMeasurement,
        updateAppointment,
        deleteAppointment,
        refreshCatalogs: loadCatalogs
    };
}
