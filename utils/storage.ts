import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveAlerts(alerts: any[]) {
  await AsyncStorage.setItem('alerts', JSON.stringify(alerts));
}

export async function loadAlerts() {
  const data = await AsyncStorage.getItem('alerts');
  return data ? JSON.parse(data) : [];
}
