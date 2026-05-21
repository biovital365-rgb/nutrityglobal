import { useState, useEffect, useCallback } from 'react';
import * as dbService from "@/actions/db-actions";
import { FoodItem, Micronutrient, Course } from "@/lib/types";

export function useNutrityData(uid: string | undefined, organizationId: string | undefined) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [measurements, setMeasurements] = useState<any[]>([]);
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const loadUserData = useCallback(async () => {
        if (!uid) return;
        try {
            const [apptData, measureData] = await Promise.all([
                dbService.getAppointments(uid, organizationId),
                dbService.getMeasurements(uid, organizationId)
            ]);
            setAppointments(apptData || []);
            setMeasurements(measureData || []);
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    }, [uid, organizationId]);

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

    useEffect(() => {
        if (!uid) {
            setIsDataLoading(false);
            return;
        }

        const init = async () => {
            setIsDataLoading(true);
            await Promise.all([loadCatalogs(), loadUserData()]);
            setIsDataLoading(false);
        };

        init();
    }, [uid, organizationId, loadCatalogs, loadUserData]);

    const saveAppointment = async (appt: any) => {
        if (!uid) throw new Error('Auth required');
        const res = await dbService.saveAppointment(uid, organizationId, appt);
        await loadUserData(); // Refresh local state
        return res;
    };

    const saveMeasurement = async (measure: any) => {
        if (!uid) throw new Error('Auth required');
        const res = await dbService.saveMeasurement(uid, organizationId, measure);
        await loadUserData(); // Refresh local state
        return res;
    };

    const updateAppointment = async (id: string, updates: any) => {
        if (!uid) throw new Error('Auth required');
        const res = await dbService.updateAppointment(id, updates);
        await loadUserData(); // Refresh local state
        return res;
    };

    const deleteAppointment = async (id: string) => {
        if (!uid) throw new Error('Auth required');
        const res = await dbService.deleteAppointment(id);
        await loadUserData(); // Refresh local state
        return res;
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
        refreshCatalogs: loadCatalogs,
        refreshUserData: loadUserData
    };
}

