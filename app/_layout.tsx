import { Stack } from "expo-router"; // Stack navigation from expo-router
import { StatusBar } from "expo-status-bar"; // Simple cross-platform status bar component
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Handles notches/status bar safe areas on iOS/Android

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register-employee"
          options={{
            title: "Cadastrar colaborador",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            title: "Registrar ponto",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="admin-home"
          options={{
            title: "Área do gestor",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="admin-employees"
          options={{
            title: "Colaboradores",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="admin-employee-detail"
          options={{
            title: "Detalhes do colaborador",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="employee-card"
          options={{
            title: "Carteirinha",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="hours-balance"
          options={{
            title: "Banco de horas",
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
