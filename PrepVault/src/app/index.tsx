import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenProtection from "../components/ScreenProtection";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("user");

  useEffect(() => {
    async function fetchUserName() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) {
          // Extract first name or use full name
          const firstName = profile.full_name.split(" ")[0];
          setUserName(firstName);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(" ")[0]);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    }
    fetchUserName();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenProtection />

      {/* Top Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>P</Text>
          </View>
          <Text style={styles.headerTitle}>PrepVault</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          CUET PG Computer Science (SCQP09)
        </Text>
        <Text style={styles.welcomeText}>Hello, {userName}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* Unlock / Upgrade Banner Card */}
          <View style={styles.upgradeCard}>
            <View style={styles.upgradeTextContainer}>
              <Text style={styles.upgradeTitle}>Unlock everything</Text>
              <Text style={styles.upgradeSubtitle}>
                One payment. Includes papers and tests added later.
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>₹99</Text>
              <Pressable
                style={styles.unlockButton}
                onPress={() => router.push("/upgrade")}
              >
                <Text style={styles.unlockButtonText}>Unlock</Text>
              </Pressable>
            </View>
          </View>

          {/* Section Header with Premium Label */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderLabel}>What you get</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          </View>

          {/* PYQ Papers Bank Section */}
          <Pressable style={styles.section} onPress={() => router.push("/pyq")}>
            <Text style={styles.heading}>PYQ Papers Bank</Text>
            <View style={styles.folder}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text style={styles.folderName}>
                2026, 2025, 2024, 2023, 2022
              </Text>
            </View>
          </Pressable>

          {/* Topicwise PYQs Section */}
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

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push("/")}>
          <Ionicons name="home" size={24} color="#2563eb" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => Alert.alert("Support", "Support contact coming soon.")}
        >
          <Ionicons name="help-circle-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Support</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerContainer: {
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#ffffff" },
  headerSubtitle: { fontSize: 13, color: "#94a3b8", marginBottom: 10 },
  welcomeText: { fontSize: 15, fontWeight: "600", color: "#e2e8f0" },
  content: { padding: 20, paddingBottom: 100 },
  main: { width: "100%", maxWidth: 600, gap: 20, alignSelf: "center" },
  upgradeCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 18,
    gap: 16,
  },
  upgradeTextContainer: { gap: 4 },
  upgradeTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  upgradeSubtitle: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceText: { fontSize: 26, fontWeight: "bold", color: "#1e293b" },
  unlockButton: {
    backgroundColor: "#1e1b4b",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  unlockButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionHeaderLabel: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  premiumBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  premiumBadgeText: { fontSize: 12, fontWeight: "600", color: "#2563eb" },
  section: { gap: 10 },
  heading: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  folder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  folderIcon: { fontSize: 22 },
  folderName: { fontSize: 14, fontWeight: "600", color: "#334155" },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 8,
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  navText: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  navTextActive: { color: "#2563eb", fontWeight: "600" },
});
