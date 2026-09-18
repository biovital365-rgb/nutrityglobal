import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

type ReportData = {
  profile?: { name?: string | null; email?: string; plan?: string; createdAt?: Date };
  route?: unknown;
  routeCreatedAt?: Date | null;
  measurements?: Array<{ id: string; label: string; value: string; date: string; time?: string | null }>;
  menu?: unknown;
  menuMeta?: { metabolicGoal?: string | null; status?: string } | null;
};
type Action = { id?: string; title?: string; description?: string; frequency?: string; completed?: boolean };
type Stage = { weeks?: string; title?: string; objective?: string };
type Route = { routeVersion?: string; phase?: string; meta?: string; insight?: string; weeklyActions?: Action[]; stages?: Stage[]; progressIndicators?: string[]; safety?: { message?: string; emergencyMessage?: string } };

const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: 'Helvetica', fontSize: 10, color: '#17324d', lineHeight: 1.5 },
  header: { backgroundColor: '#17324d', color: '#ffffff', padding: 22, borderRadius: 10, marginBottom: 22 },
  brand: { fontSize: 9, letterSpacing: 2, color: '#e6d3a8', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 10, color: '#d8e2e8' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#17324d' },
  card: { border: '1 solid #dbe3e8', borderRadius: 8, padding: 12, marginBottom: 9 },
  label: { fontSize: 8, letterSpacing: 1, color: '#8a6b36', marginBottom: 3 },
  strong: { fontSize: 11, fontWeight: 700, marginBottom: 3 },
  muted: { color: '#5f7180' },
  completed: { color: '#147d4a' },
  warning: { backgroundColor: '#fff7df', border: '1 solid #e8c66a', borderRadius: 8, padding: 12, marginTop: 10 },
  footer: { position: 'absolute', bottom: 25, left: 42, right: 42, fontSize: 8, color: '#7a8b98', textAlign: 'center' },
});

export function NutrityNativeReport({ data, viewMode = 'patient' }: { data: ReportData; viewMode?: 'patient' | 'coach' | 'partial'; userStatus?: string }) {
  const route = (data.route && typeof data.route === 'object' ? data.route : {}) as Route;
  const actions = Array.isArray(route.weeklyActions) ? route.weeklyActions : [];
  const stages = Array.isArray(route.stages) ? route.stages : [];
  const measurements = Array.isArray(data.measurements) ? data.measurements : [];

  return <Document title="Reporte de progreso · Nutrity Global" author="Nutrity Global">
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.brand}>NUTRITY GLOBAL</Text>
        <Text style={styles.title}>Reporte educativo de progreso</Text>
        <Text style={styles.subtitle}>Ruta de hábitos y registros proporcionados por la persona usuaria</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.card}><Text style={styles.label}>PERSONA</Text><Text style={styles.strong}>{data.profile?.name || 'Usuario Nutrity'}</Text><Text style={styles.muted}>{data.profile?.email || ''}</Text></View>
        <View style={styles.card}><Text style={styles.label}>ETAPA ACTUAL</Text><Text style={styles.strong}>{route.phase || 'Ruta pendiente de actualización'}</Text><Text style={styles.muted}>{route.insight || 'Completa la evaluación para crear una ruta educativa.'}</Text></View>
        <View style={styles.card}><Text style={styles.label}>OBJETIVO DECLARADO</Text><Text style={styles.strong}>{route.meta || 'No registrado'}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones de la semana</Text>
        {actions.length ? actions.map((action, index) => <View key={action.id || String(index)} style={styles.card}>
          <Text style={[styles.label, action.completed ? styles.completed : {}]}>{action.completed ? 'REGISTRADA COMO COMPLETADA' : 'PENDIENTE'} · {action.frequency || ''}</Text>
          <Text style={styles.strong}>{action.title || 'Acción'}</Text><Text style={styles.muted}>{action.description || ''}</Text>
        </View>) : <Text style={styles.muted}>No hay acciones registradas.</Text>}
      </View>

      <View style={styles.warning}><Text style={styles.strong}>Límite de uso</Text><Text>{route.safety?.message || 'Este reporte es educativo y no sustituye evaluación médica.'}</Text><Text style={{ marginTop: 5 }}>{route.safety?.emergencyMessage || 'Ante una urgencia, busca atención de emergencia local.'}</Text></View>
      <Text style={styles.footer}>Nutrity Global · No constituye diagnóstico, prescripción ni pronóstico · Vista {viewMode}</Text>
    </Page>

    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Recorrido de 12 semanas</Text>
      {stages.map((stage, index) => <View key={`${stage.weeks}-${index}`} style={styles.card}><Text style={styles.label}>SEMANAS {stage.weeks}</Text><Text style={styles.strong}>{stage.title}</Text><Text style={styles.muted}>{stage.objective}</Text></View>)}

      <View style={[styles.section, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Registros informados</Text>
        <Text style={[styles.muted, { marginBottom: 8 }]}>Los siguientes valores fueron ingresados por la persona o su equipo. Nutrity no los estima ni proyecta.</Text>
        {measurements.length ? measurements.map(item => <View key={item.id} style={styles.card}><Text style={styles.label}>{item.date} {item.time || ''}</Text><Text style={styles.strong}>{item.label}: {item.value}</Text></View>) : <Text style={styles.muted}>No hay mediciones registradas.</Text>}
      </View>
      <Text style={styles.footer}>Comparte este documento con un profesional habilitado si necesitas interpretar datos clínicos.</Text>
    </Page>
  </Document>;
}
