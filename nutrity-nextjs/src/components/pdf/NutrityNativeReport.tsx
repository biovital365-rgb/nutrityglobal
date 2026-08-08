import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fbf8f1', // Cream
        padding: 40,
        fontFamily: 'Helvetica',
        color: '#1b3b36' // Forest Green
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#1b3b36',
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        wrap: false
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1b3b36', // Forest Green
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        color: '#c19b6c', // Gold
        textTransform: 'uppercase',
        marginTop: 4,
    },
    section: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#c19b6c',
        marginBottom: 10,
        textTransform: 'uppercase'
    },
    text: {
        fontSize: 11,
        lineHeight: 1.5,
        color: '#334155'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4
    },
    label: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    value: {
        fontSize: 11,
        color: '#1b3b36',
        fontWeight: 'bold',
        maxWidth: '65%',
        textAlign: 'right'
    },
    gridBox: {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#c19b6c',
        marginBottom: 8
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
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1b3b36',
        padding: 6,
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 6,
        fontSize: 10,
        color: '#334155'
    },
    col1: { width: '30%' },
    col2: { width: '40%' },
    col3: { width: '30%', textAlign: 'right' },
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
        measurements?: any[];
    }
}

export function NutrityNativeReport({ data }: NativeReportProps) {
    const { profile, diagnosis, menu, academic, measurements } = data;
    const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    const rawAnswers = diagnosis?.rawAnswers ? (typeof diagnosis.rawAnswers === 'string' ? JSON.parse(diagnosis.rawAnswers) : diagnosis.rawAnswers) : null;

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap={true}>
                {/* CABECERA */}
                <View style={styles.header} fixed>
                    <View>
                        <Text style={styles.title}>NUTRITY GLOBAL | BioVital.360</Text>
                        <Text style={styles.subtitle}>Expediente Clínico</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.label}>Fecha de Emisión</Text>
                        <Text style={[styles.value, { textAlign: 'right' }]}>{dateStr}</Text>
                    </View>
                </View>

                {/* 1. PERFIL */}
                <View style={styles.section} wrap={false}>
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

                {/* 2. DIAGNÓSTICO (NMG) */}
                <View style={styles.section} wrap={true}>
                    <Text style={styles.sectionTitle}>2. Diagnóstico Biológico & NMG</Text>
                    {diagnosis ? (
                        <View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Condición / Fase</Text>
                                <Text style={styles.value}>{diagnosis.condition || diagnosis.phase || "Evaluación General"}</Text>
                            </View>

                            {/* Renderizado Condicional NMG */}
                            {diagnosis.mainSymptom && (
                                <View style={styles.gridBox} wrap={false}>
                                    <Text style={styles.label}>Síntoma Principal</Text>
                                    <Text style={[styles.text, { fontWeight: 'bold' }]}>{diagnosis.mainSymptom}</Text>
                                    {diagnosis.symptomDuration && (
                                        <Text style={[styles.text, { fontSize: 9, color: '#64748b' }]}>Duración: {diagnosis.symptomDuration}</Text>
                                    )}
                                </View>
                            )}

                            {diagnosis.affectedSystem && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>Sistema Biológico Afectado</Text>
                                    <Text style={styles.value}>{diagnosis.affectedSystem}</Text>
                                </View>
                            )}

                            {diagnosis.nmgOrgan && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>Órgano Conflicto (NMG)</Text>
                                    <Text style={styles.value}>{diagnosis.nmgOrgan}</Text>
                                </View>
                            )}

                            {diagnosis.nmgConflict && (
                                <View style={styles.gridBox} wrap={false}>
                                    <Text style={styles.label}>Conflicto Biológico Descodificado</Text>
                                    <Text style={[styles.text, { fontStyle: 'italic', marginTop: 3 }]}>
                                        "{diagnosis.nmgConflict}"
                                    </Text>
                                </View>
                            )}

                            {diagnosis.emotionalContext && (
                                <View style={styles.gridBox} wrap={false}>
                                    <Text style={styles.label}>Contexto Emocional</Text>
                                    <Text style={styles.text}>{diagnosis.emotionalContext}</Text>
                                </View>
                            )}

                            {diagnosis.insight && (
                                <Text style={[styles.text, { marginTop: 10, fontStyle: 'italic' }]}>
                                    Evaluación IA: "{diagnosis.insight}"
                                </Text>
                            )}
                            
                            {rawAnswers && Object.keys(rawAnswers).length > 0 && (
                                <View style={{ marginTop: 15 }} wrap={false}>
                                    <Text style={[styles.label, { marginBottom: 5 }]}>Datos del Triaje (Raw):</Text>
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
                        </View>
                    ) : (
                        <View style={styles.fallbackBox} wrap={false}>
                            <Text style={styles.fallbackText}>Información aún no disponible. Completa tu Triaje inicial para generar tu diagnóstico.</Text>
                        </View>
                    )}
                </View>

                {/* 3. EVOLUCIÓN BIOMÉTRICA */}
                <View style={styles.section} wrap={true}>
                    <Text style={styles.sectionTitle}>3. Evolución Biométrica</Text>
                    {measurements && measurements.length > 0 ? (
                        <View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.col1}>FECHA / HORA</Text>
                                <Text style={styles.col2}>MÉTRICA</Text>
                                <Text style={styles.col3}>VALOR</Text>
                            </View>
                            {measurements.map((m: any, i: number) => (
                                <View style={styles.tableRow} key={i} wrap={false}>
                                    <Text style={styles.col1}>{m.date} {m.time ? `(${m.time})` : ''}</Text>
                                    <Text style={styles.col2}>{m.label}</Text>
                                    <Text style={[styles.col3, { fontWeight: 'bold' }]}>{m.value}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.fallbackBox} wrap={false}>
                            <Text style={styles.fallbackText}>No hay mediciones registradas en el historial.</Text>
                        </View>
                    )}
                </View>

                {/* 4. PLAN NUTRICIONAL */}
                <View style={styles.section} wrap={true}>
                    <Text style={styles.sectionTitle}>4. Plan Nutricional Asignado</Text>
                    {menu ? (
                        <View>
                            <Text style={[styles.text, { marginBottom: 10 }]}>
                                Tu menú semanal ha sido generado y está activo. Para ver las recetas detalladas, por favor consulta la sección "Menú" en la plataforma.
                            </Text>
                            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((day) => {
                                if (!menu[day]) return null;
                                return (
                                    <View key={day} style={{ marginBottom: 6, backgroundColor: '#f8fafc', padding: 8, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: '#1b3b36' }} wrap={false}>
                                        <Text style={[styles.label, { color: '#1b3b36', marginBottom: 4 }]}>{day.toUpperCase()}</Text>
                                        <Text style={[styles.text, { fontSize: 10 }]}>• Desayuno: {menu[day].breakfast}</Text>
                                        <Text style={[styles.text, { fontSize: 10 }]}>• Almuerzo: {menu[day].lunch}</Text>
                                        <Text style={[styles.text, { fontSize: 10 }]}>• Cena: {menu[day].dinner}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    ) : (
                        <View style={styles.fallbackBox} wrap={false}>
                            <Text style={styles.fallbackText}>No tienes un menú asignado actualmente. Consulta a tu coach.</Text>
                        </View>
                    )}
                </View>

                {/* 5. ACADEMIA Y FEEDBACK */}
                <View style={styles.section} wrap={true}>
                    <Text style={styles.sectionTitle}>5. Progreso Académico</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Lecciones Completadas</Text>
                        <Text style={styles.value}>{academic.completedLessonsCount || 0}</Text>
                    </View>

                    {academic.quizAttempts && academic.quizAttempts.length > 0 && (
                        <View style={{ marginTop: 10 }} wrap={false}>
                            <Text style={[styles.label, { marginBottom: 5 }]}>Cuestionarios Recientes:</Text>
                            {academic.quizAttempts.slice(0,3).map((quiz: any, i: number) => (
                                <View key={i} style={styles.row}>
                                    <Text style={styles.text}>Evaluación (ID: {quiz.quizId.slice(-4)})</Text>
                                    <Text style={styles.value}>{quiz.score}% ({quiz.passed ? 'Aprobado' : 'Reprobado'})</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {academic.assignmentSubmissions && academic.assignmentSubmissions.length > 0 && (
                        <View style={{ marginTop: 15 }} wrap={false}>
                            <Text style={[styles.label, { marginBottom: 5 }]}>Últimas Tareas Evaluadas:</Text>
                            {academic.assignmentSubmissions.slice(0,3).map((sub: any, i: number) => (
                                <View key={i} style={{ backgroundColor: '#f8fafc', padding: 8, borderRadius: 4, marginBottom: 5, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={[styles.label, { color: sub.status === 'APPROVED' ? '#10b981' : sub.status === 'REJECTED' ? '#ef4444' : '#c19b6c' }]}>
                                        ESTADO: {sub.status}
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
                    )}
                </View>

                {/* FOOTER AUTOMÁTICO EN TODAS LAS PÁGINAS */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>BioVital Global Technologies © {new Date().getFullYear()}</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (`Página ${pageNumber} de ${totalPages}`)} />
                </View>
            </Page>
        </Document>
    );
}
