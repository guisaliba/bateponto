import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

type Profile = {
  full_name: string | null;
  work_email: string | null;
  role: string | null;
};

export default function EmployeeCardScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No logged-in user:", userError);
        Alert.alert("Sessão expirada", "Faça login novamente.");
        return;
      }

      setEmail(user.email ?? "");
      setCreatedAt(user.created_at ? new Date(user.created_at) : null);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, work_email, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        Alert.alert("Erro", "Não foi possível carregar sua carteirinha.");
        return;
      }

      setProfile(data as Profile);
    };

    load();
  }, []);

  const displayName =
    profile?.full_name ?? profile?.work_email ?? email ?? "Colaborador";

  const roleLabel = profile?.role === "admin" ? "Gestor" : "Colaborador";

  const createdAtText =
    createdAt != null
      ? createdAt.toLocaleDateString("pt-BR")
      : "Não disponível";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carteirinha</Text>
      <Text style={styles.subtitle}>
        Seus dados de identificação no sistema.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{displayName}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {profile?.work_email ?? email ?? "Não informado"}
        </Text>

        <Text style={styles.label}>Tipo de usuário</Text>
        <Text style={styles.value}>{roleLabel}</Text>

        <Text style={styles.label}>Data de cadastro</Text>
        <Text style={styles.value}>{createdAtText}</Text>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace("/"); // index.tsx
        }}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.navItemText}>Ponto</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={[styles.navItemText, styles.navItemTextActive]}>
            Carteirinha
          </Text>
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/hours-balance")}
        >
          <Text style={styles.navItemText}>Saldo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f9fafb",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },
  card: {
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  bottomNav: {
    marginTop: "auto",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: "#111827",
  },
  navItemText: {
    fontSize: 13,
    color: "#6b7280",
  },
  navItemTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
});
