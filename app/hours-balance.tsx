import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import {
  computeMonthlySummary,
  formatDurationHMS,
  type MonthlySummary,
} from "../lib/timeSummary";
import type { PunchType } from "../lib/utils";

export default function HoursBalanceScreen() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No logged-in user:", userError);
        Alert.alert("Sessão expirada", "Faça login novamente.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("time_entries")
        .select("type, timestamp")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error loading time entries for summary:", error);
        Alert.alert(
          "Erro",
          "Não foi possível carregar seu saldo de horas do mês."
        );
        setLoading(false);
        return;
      }

      const rawEntries =
        (data ?? []).map((row: any) => ({
          type: row.type as PunchType,
          timestamp: row.timestamp as string,
        })) ?? [];

      const s = computeMonthlySummary(rawEntries);
      setSummary(s);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saldo de horas</Text>
      <Text style={styles.subtitle}>
        Total de horas trabalhadas no mês atual, considerando jornada de 8h/dia.
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Calculando saldo...</Text>
        </View>
      ) : !summary ? (
        <Text style={styles.emptyText}>
          Ainda não há dados suficientes para calcular o saldo.
        </Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Total trabalhado no mês</Text>
          <Text style={styles.value}>{formatDurationHMS(summary.totalMs)}</Text>

          <Text style={styles.label}>
            Carga esperada (8h/dia, {summary.workDays} dia(s))
          </Text>
          <Text style={styles.value}>
            {formatDurationHMS(summary.expectedMs)}
          </Text>

          <Text style={styles.label}>Saldo no mês</Text>
          <Text
            style={[
              styles.value,
              summary.saldoMs >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {formatDurationHMS(summary.saldoMs)}
          </Text>

          <Text style={styles.hint}>
            Sua empresa definiu que sua escala de trabalho é de 48h semanais
            (8h/dia).
          </Text>
        </View>
      )}

      {/* bottom nav */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.navItemText}>Ponto</Text>
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/employee-card")}
        >
          <Text style={styles.navItemText}>Carteirinha</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={[styles.navItemText, styles.navItemTextActive]}>
            Saldo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f9fafb", gap: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  subtitle: { fontSize: 14, color: "#4b5563", marginTop: 4 },
  center: { marginTop: 32, alignItems: "center", gap: 8 },
  loadingText: { fontSize: 14, color: "#4b5563" },
  emptyText: { marginTop: 24, fontSize: 14, color: "#6b7280" },
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
  label: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  value: { fontSize: 16, fontWeight: "600", color: "#111827" },
  positive: { color: "#16a34a" },
  negative: { color: "#dc2626" },
  hint: { marginTop: 8, fontSize: 12, color: "#6b7280" },

  bottomNav: {
    marginTop: "auto",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  navItemActive: { borderTopWidth: 2, borderTopColor: "#111827" },
  navItemText: { fontSize: 13, color: "#6b7280" },
  navItemTextActive: { color: "#111827", fontWeight: "600" },
});
