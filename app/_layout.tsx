import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { migrateDatabase } from '../src/db/migrations';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    migrateDatabase()
      .then(() => setIsReady(true))
      .catch(console.error);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#185FA5" />
        <Text style={{ marginTop: 12, color: '#888' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="modals/add-depense"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Nouvelle dépense',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#185FA5',
        }}
      />
      <Stack.Screen
          name="modals/edit-depense"
          options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Modifier la dépense',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#185FA5',
        }}
        />
      <Stack.Screen
        name="modals/add-budget"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Nouveau budget',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#185FA5',
        }}
      />
      <Stack.Screen
        name="modals/edit-budget"
        options={{
        presentation: 'modal',
        headerShown: true,
        title: 'Modifier le budget',
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#185FA5',
  }}
/>
    </Stack>
  );
}