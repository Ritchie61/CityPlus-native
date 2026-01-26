import { useEffect, useState } from 'react';
import { FlatList, Text, View, Button, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { loadAlerts, saveAlerts } from '@/utils/storage';
import { useRouter } from 'expo-router';

interface Alert {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const MAX_ALERTS = 50;

export default function HomeScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const router = useRouter();

  const mergeAlerts = (newAlerts: Alert[]) => {
    const combined = [...newAlerts, ...alerts.filter(a => !newAlerts.find(n => n.id === a.id))];
    return combined.slice(0, MAX_ALERTS);
  };

  async function fetchAlerts() {
    try {
      const offline = await loadAlerts();
      if (offline?.length) setAlerts(offline);

      const { data, error } = await supabase
        .from<Alert>('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch alerts:', error.message);
      } else if (data?.length) {
        const merged = mergeAlerts(data);
        setAlerts(merged);
        saveAlerts(merged);
      }
    } catch (err) {
      console.error('Unexpected error fetching alerts:', err);
    }
  }

  useEffect(() => {
    fetchAlerts();

    // Create a real-time channel for alerts table
    const alertsChannel = supabase.channel('alerts_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        setAlerts(prev => {
          const updated = mergeAlerts([payload.new]);
          saveAlerts(updated);
          return updated;
        });
      })
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Add Alert" onPress={() => router.push('/new-alert')} />
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  alertCard: { marginVertical: 8, padding: 12, backgroundColor: '#eee', borderRadius: 8 },
  title: { fontWeight: 'bold', marginBottom: 4 },
});
