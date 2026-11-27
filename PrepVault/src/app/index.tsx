import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenProtection from "../components/ScreenProtection";
import { usePremiumAccess } from "../context/PremiumAccessContext";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const { status } = usePremiumAccess();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenProtection />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.main}>
          <Pressable onPress={handleSignOut} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          {status === "paid" && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium Member ✓</Text>
            </View>
          )}

          {status === "unpaid" && (
            <Pressable
              onPress={() => router.push("/upgrade" as any)}
              style={styles.upgradeButton}
            >
              <Text style={styles.upgradeText}>Upgrade to Premium — ₹99</Text>
            </Pressable>
          )}

          <Pressable style={styles.section} onPress={() => router.push("/pyq")}>
            <Text style={styles.heading}>PYQ Papers Bank</Text>

            <View style={styles.folder}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text style={styles.folderName}>
                2026, 2025, 2024, 2023, 2022
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.section}
            onPress={() => router.push("/topicwise")}
          >
            <Text style={styles.heading}>Topicwise PYQs</Text>

            <View style={styles.folder}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text style={styles.folderName}>Maths, Computer, Reasoning</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  premiumBadge: {
    backgroundColor: "#dcfce7",
    padding: 14,
    borderRadius: 10,
    marginTop: -20,
  },

  premiumText: {
    color: "#166534",
    textAlign: "center",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    alignItems: "center",
    padding: 24,
  },

  main: {
    width: "100%",
    maxWidth: 600,
    gap: 36,
  },

  signOut: {
    backgroundColor: "#dc2626",
    padding: 14,
    width: 100,
    borderRadius: 10,
    marginTop: 20,
  },

  signOutText: {
    color: "#ffffff",
    textAlign: "center",
  },

  upgradeButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: -20,
  },

  upgradeText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },

  section: {
    gap: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },

  folder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
  },

  folderIcon: {
    fontSize: 26,
  },

  folderName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
});
