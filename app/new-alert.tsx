import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { loadAlerts, saveAlerts } from '@/utils/storage';
import { useRouter } from 'expo-router';

export default function NewAlert() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  async function handleSubmit() {
    if (!title || !description) return Alert.alert('Please fill all fields');

    const { data, error } = await supabase
      .from('alerts')
      .insert([{ title, description }])
      .select();

    if (data) {
      const offline = await loadAlerts();
      await saveAlerts([data[0], ...offline]);
      router.back();
    } else {
      Alert.alert('Error', error?.message);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 6 },
});
