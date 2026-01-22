import { useEffect, useState } from 'react';
import { FlatList, Text, View, Button, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { loadAlerts, saveAlerts } from '@/utils/storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const router = useRouter();

  async function fetchAlerts() {
    const offline = await loadAlerts();
    setAlerts(offline);

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAlerts(data);
      saveAlerts(data);
    }
  }

  useEffect(() => {
    fetchAlerts();

    const subscription = supabase
      .from('alerts')
      .on('INSERT', payload => setAlerts(prev => [payload.new, ...prev]))
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
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
