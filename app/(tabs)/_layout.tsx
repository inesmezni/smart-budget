import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Librairie d'icônes

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#185FA5',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#eee',
          paddingTop: 8,
          paddingBottom: 20,
          height: 100,
        },
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#185FA5',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >

        {/* ----------- Onglet Accueil ----------- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      
      {/* ----------- Onglet Dépenses ----------- */}
      <Tabs.Screen
        name="depenses"
        options={{
          title: 'Dépenses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />


      {/* ----------- Onglet Budgets ----------- */}
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color} />
          ),
        }}
      />


       {/* ----------- Onglet Statistiques ----------- */}
       <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}