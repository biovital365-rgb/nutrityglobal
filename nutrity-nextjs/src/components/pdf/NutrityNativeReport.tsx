import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts (we'll use built-in standard fonts like Helvetica for simplicity, 
// but we can register custom ones if needed).
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fbf8f1',
        padding: 40,
        fontFamily: 'Helvetica',
        color: '#1b3b36'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1b3b36',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1b3b36'
    },
    subtitle: {
        fontSize: 10,
        color: '#c19b6c',
        textTransform: 'uppercase',
    },
    section: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#c19b6c',
        marginBottom: 10,
        textTransform: 'uppercase'
    },
    text: {
        fontSize: 12,
        lineHeight: 1.5,
        color: '#334155'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 3
    },
    label: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    value: {
        fontSize: 12,
        color: '#1b3b36',
        fontWeight: 'bold'
    },
    fallbackBox: {
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: 10
    },
    fallbackText: {
        fontSize: 11,
        color: '#64748b',
        fontStyle: 'italic'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#1b3b36',
        paddingTop: 10
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
        textTransform: 'uppercase'
    }
});

interface NativeReportProps {
    data: {
        profile: any;
        diagnosis: any;
        menu: any;
        academic: any;
    }
}

export function NutrityNativeReport({ data }: NativeReportProps) {
    const { profile, diagnosis, menu, academic } = data;
    const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    // Helper to safely render raw answers if diagnosis exists
    const rawAnswers = diagnosis?.rawAnswers ? (typeof diagnosis.rawAnswers === 'string' ? JSON.parse(diagnosis.rawAnswers) : diagnosis.rawAnswers) : null;

    return (
        <Document>
            {/* PORTADA Y PERFIL */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>NUTRITY GLOBAL</Text>
                        <Text style={styles.subtitle}>Expediente Clínico Integral</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>Fecha de Emisión</Text>
                        <Text style={styles.value}>{dateStr}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Perfil del Paciente</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nombre Completo</Text>
                        <Text style={styles.value}>{profile.name || "No registrado"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <Text style={styles.value}>{profile.email}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Plan Actual</Text>
                        <Text style={styles.value}>{profile.plan || "Gratuito"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha de Registro</Text>
                        <Text style={styles.value}>{new Date(profile.createdAt).toLocaleDateString('es-ES')}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Diagnóstico Biológico</Text>
                    {diagnosis ? (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.label}>Condición Principal</Text>
                                <Text style={styles.value}>{diagnosis.condition || "Evaluación General"}</Text>
                            </View>
                            <Text style={[styles.text, { marginTop: 10, fontStyle: 'italic' }]}>
                                "{diagnosis.insight || "En proceso de restauración metabólica."}"
                            </Text>
                            
                            {rawAnswers && (
                                <View style={{ marginTop: 15 }}>
                                    <Text style={[styles.label, { marginBottom: 5 }]}>Datos del Triaje:</Text>
                                    {Object.entries(rawAnswers).map(([k, v], i) => {
                                        if (typeof v === 'object' || !v) return null;
                                        return (
                                            <View style={styles.row} key={i}>
                                                <Text style={styles.label}>{k}</Text>
                                                <Text style={styles.value}>{String(v)}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.fallbackBox}>
                            <Text style={styles.fallbackText}>Información aún no disponible. Completa tu Triaje inicial para generar tu diagnóstico.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>BioVital Global Technologies</Text>
                    <Text style={styles.footerText}>Página 1</Text>
                </View>
            </Page>

            {/* MENÚ Y PROGRESO */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>RESUMEN NUTRICIONAL Y ACADÉMICO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Plan Nutricional Asignado</Text>
                    {menu ? (
                        <View>
                            <Text style={styles.text}>Tu menú semanal ha sido generado y está activo. Para ver las recetas detalladas y las porciones exactas, por favor consulta la sección "Menú" en tu plataforma.</Text>
                            <View style={{ marginTop: 10 }}>
                                {['lunes', 'martes', 'miercoles'].map((day) => {
                                    if (!menu[day]) return null;
                                    return (
                                        <View key={day} style={{ marginBottom: 10, backgroundColor: '#f8fafc', padding: 8, borderRadius: 4 }}>
                                            <Text style={[styles.label, { color: '#1b3b36' }]}>{day.toUpperCase()}</Text>
                                            <Text style={[styles.text, { fontSize: 10 }]}>• Desayuno: {menu[day].breakfast}</Text>
                                            <Text style={[styles.text, { fontSize: 10 }]}>• Almuerzo: {menu[day].lunch}</Text>
                                            <Text style={[styles.text, { fontSize: 10 }]}>• Cena: {menu[day].dinner}</Text>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.fallbackBox}>
                            <Text style={styles.fallbackText}>No tienes un menú asignado actualmente. Consulta a tu coach o genera tu plan en la plataforma.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Progreso Académico y Feedback</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Lecciones Completadas</Text>
                        <Text style={styles.value}>{academic.completedLessonsCount || 0}</Text>
                    </View>

                    {academic.quizAttempts && academic.quizAttempts.length > 0 && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={[styles.label, { marginBottom: 5 }]}>Cuestionarios Recientes:</Text>
                            {academic.quizAttempts.slice(0,3).map((quiz: any, i: number) => (
                                <View key={i} style={styles.row}>
                                    <Text style={styles.text}>Quiz ID: {quiz.quizId.slice(-4)}</Text>
                                    <Text style={styles.value}>{quiz.score}% ({quiz.passed ? 'Aprobado' : 'Reprobado'})</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {academic.assignmentSubmissions && academic.assignmentSubmissions.length > 0 ? (
                        <View style={{ marginTop: 15 }}>
                            <Text style={[styles.label, { marginBottom: 5 }]}>Feedback de Tareas:</Text>
                            {academic.assignmentSubmissions.slice(0,3).map((sub: any, i: number) => (
                                <View key={i} style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 4, marginBottom: 5 }}>
                                    <Text style={[styles.label, { color: sub.status === 'APPROVED' ? '#10b981' : sub.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }]}>
                                        Estado: {sub.status}
                                    </Text>
                                    {sub.coachFeedback ? (
                                        <Text style={[styles.text, { marginTop: 4, fontStyle: 'italic' }]}>
                                            " {sub.coachFeedback} "
                                        </Text>
                                    ) : (
                                        <Text style={[styles.text, { marginTop: 4 }]}>En revisión...</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.fallbackBox}>
                            <Text style={styles.fallbackText}>No hay tareas enviadas o feedback disponible por el momento.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>BioVital Global Technologies</Text>
                    <Text style={styles.footerText}>Página 2</Text>
                </View>
            </Page>
        </Document>
    );
}
