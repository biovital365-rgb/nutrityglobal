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
    logoBox: {
        flexDirection: 'column',
    },
    logoText1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1b3b36',
        textTransform: 'uppercase',
    },
    logoText2: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#c19b6c', // Gold
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    titleBox: {
        alignItems: 'flex-end'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1b3b36',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        color: '#c19b6c',
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
    alertBox: {
        backgroundColor: '#fef2f2',
        padding: 10,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
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
    },
    dayCard: {
        marginBottom: 8, 
        backgroundColor: '#ffffff', 
        padding: 10, 
        borderRadius: 6, 
        borderWidth: 1, 
        borderColor: '#e2e8f0',
        borderLeftWidth: 4,
        borderLeftColor: '#1b3b36'
    }
});

interface NativeReportProps {
    data: {
        profile: any;
        diagnosis: any;
        menu: any;
        menuMeta?: any;
        academic: any;
        measurements?: any[];
    };
    viewMode?: 'patient' | 'coach';
    userStatus?: string;
}

export function NutrityNativeReport({ data, viewMode = 'patient', userStatus = 'ACTIVE' }: NativeReportProps) {
    const { profile, diagnosis, menu, menuMeta, academic, measurements } = data;
    const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    const rawAnswers = diagnosis?.rawAnswers ? (typeof diagnosis.rawAnswers === 'string' ? JSON.parse(diagnosis.rawAnswers) : diagnosis.rawAnswers) : null;
    const isCoach = viewMode === 'coach';

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap={true}>
                {/* CABECERA */}
                <View style={styles.header} fixed>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText1}>BIOVITAL 365</Text>
                        <Text style={styles.logoText2}>Nutrity Global</Text>
                    </View>
                    <View style={styles.titleBox}>
                        <Text style={styles.title}>
                            {isCoach ? 'Expediente Clínico' : 'Plan Integral de Remisión'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isCoach ? `ID: ${profile.id.slice(0,8).toUpperCase()}` : `Emitido: ${dateStr}`}
                        </Text>
                    </View>
                </View>

                {/* NOTAS CLÍNICAS (SOLO COACH) */}
                {isCoach && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Panel de Control Clínico (Uso Interno)</Text>
                        
                        <View style={styles.row}>
                            <Text style={styles.label}>Estado del Paciente</Text>
                            <Text style={[styles.value, { color: userStatus === 'ACTIVE' ? '#059669' : userStatus === 'OBSERVED' ? '#d97706' : '#dc2626' }]}>
                                {userStatus}
                            </Text>
                        </View>

                        {menuMeta?.status && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Estado del Menú</Text>
                                <Text style={styles.value}>{menuMeta.status}</Text>
                            </View>
                        )}
                        
                        {menuMeta?.metabolicGoal && (
                            <View style={styles.gridBox} wrap={false}>
                                <Text style={styles.label}>Meta Metabólica (Coach)</Text>
                                <Text style={styles.text}>{menuMeta.metabolicGoal}</Text>
                            </View>
                        )}

                        {menuMeta?.adminNotes && (
                            <View style={styles.alertBox} wrap={false}>
                                <Text style={[styles.label, { color: '#ef4444' }]}>Notas y Banderas Clínicas</Text>
                                <Text style={styles.text}>{menuMeta.adminNotes}</Text>
                            </View>
                        )}
                    </View>
                )}

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
                        <Text style={styles.label}>Suscripción</Text>
                        <Text style={styles.value}>{profile.subscriptionStatus || "N/A"}</Text>
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
                                <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f0fdf4', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#22c55e' }} wrap={false}>
                                    <Text style={[styles.label, { color: '#166534' }]}>Guía de Remisión (IA)</Text>
                                    <Text style={[styles.text, { fontStyle: 'italic', marginTop: 4 }]}>"{diagnosis.insight}"</Text>
                                </View>
                            )}
                            
                            {/* SOLO COACH: Raw Answers del Triaje */}
                            {isCoach && rawAnswers && Object.keys(rawAnswers).length > 0 && (
                                <View style={{ marginTop: 15 }} wrap={false}>
                                    <Text style={[styles.label, { marginBottom: 5 }]}>Datos del Triaje Clínico (Raw):</Text>
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

                {/* 3. EVOLUCIÓN BIOMÉTRICA (SOLO COACH o si hay datos) */}
                {(isCoach || (measurements && measurements.length > 0)) && (
                    <View style={styles.section} wrap={true}>
                        <Text style={styles.sectionTitle}>3. Evolución Biométrica</Text>
                        {measurements && measurements.length > 0 ? (
                            <View>
                                <View style={styles.tableHeader} wrap={false}>
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
                )}

                {/* 4. PLAN NUTRICIONAL */}
                <View style={styles.section} wrap={true}>
                    <Text style={styles.sectionTitle}>4. Plan Nutricional Asignado</Text>
                    {menu ? (
                        <View>
                            <Text style={[styles.text, { marginBottom: 15 }]}>
                                {isCoach 
                                    ? "Menú semanal activo para el paciente:"
                                    : "Tu menú semanal ha sido generado y está activo. Sigue estas pautas o consúltalas en la app."}
                            </Text>
                            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((day) => {
                                if (!menu[day]) return null;
                                return (
                                    <View key={day} style={styles.dayCard} wrap={false}>
                                        <Text style={[styles.label, { color: '#1b3b36', marginBottom: 6 }]}>{day.toUpperCase()}</Text>
                                        
                                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                            <Text style={[styles.label, { width: '20%' }]}>Desayuno:</Text>
                                            <Text style={[styles.text, { width: '80%' }]}>{menu[day].breakfast}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                            <Text style={[styles.label, { width: '20%' }]}>Almuerzo:</Text>
                                            <Text style={[styles.text, { width: '80%' }]}>{menu[day].lunch}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                            <Text style={[styles.label, { width: '20%' }]}>Cena:</Text>
                                            <Text style={[styles.text, { width: '80%' }]}>{menu[day].dinner}</Text>
                                        </View>
                                        {menu[day].snacks && (
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={[styles.label, { width: '20%' }]}>Snack:</Text>
                                                <Text style={[styles.text, { width: '80%', fontStyle: 'italic' }]}>{menu[day].snacks}</Text>
                                            </View>
                                        )}
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
                    
                    <View style={styles.row} wrap={false}>
                        <Text style={styles.label}>Lecciones Completadas</Text>
                        <Text style={styles.value}>{academic.completedLessonsCount || 0}</Text>
                    </View>

                    {academic.quizAttempts && academic.quizAttempts.length > 0 && (
                        <View style={{ marginTop: 10 }} wrap={false}>
                            <Text style={[styles.label, { marginBottom: 5 }]}>Cuestionarios Recientes:</Text>
                            {academic.quizAttempts.slice(0,3).map((quiz: any, i: number) => (
                                <View key={i} style={styles.row} wrap={false}>
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
                                <View key={i} style={{ backgroundColor: '#f8fafc', padding: 8, borderRadius: 4, marginBottom: 5, borderWidth: 1, borderColor: '#e2e8f0' }} wrap={false}>
                                    <Text style={[styles.label, { color: sub.status === 'APPROVED' ? '#10b981' : sub.status === 'REJECTED' ? '#ef4444' : '#c19b6c' }]}>
                                        ESTADO: {sub.status}
                                    </Text>
                                    {sub.coachFeedback ? (
                                        <Text style={[styles.text, { marginTop: 4, fontStyle: 'italic' }]}>
                                            "{sub.coachFeedback}"
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
