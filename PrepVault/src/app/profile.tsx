import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenProtection from "../components/ScreenProtection";
import { supabase } from "../lib/supabase";

type UserProfile = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [aboutModalVisible, setAboutModalVisible] = useState<boolean>(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile details from public.profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
          // Fallback to auth user metadata if profile row isn't created yet
          setProfile({
            full_name: user.user_metadata?.full_name || "PrepVault User",
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        }

        // Fetch payment access status
        const { data: accessData } = await supabase
          .from("user_access")
          .select("is_paid")
          .eq("user_id", user.id)
          .single();

        if (accessData) {
          setIsPaid(accessData.is_paid);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }
    loadUserData();
  }, []);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenProtection />

      {/* Top Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>
          Manage your account and preferences
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* User Info Card (Fetched PFP, Name, Email) */}
          <View style={styles.card}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={32} color="#2563eb" />
              </View>
            )}
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>
                {profile?.full_name || "PrepVault User"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {profile?.email || "user@prepvault.com"}
              </Text>
            </View>
          </View>

          {/* Access / Plan Status Card */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.labelGroup}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#2563eb"
                />
                <Text style={styles.cardTitle}>Plan Status</Text>
              </View>
              <View
                style={[
                  styles.planBadge,
                  isPaid ? styles.badgePremium : styles.badgeFree,
                ]}
              >
                <Text
                  style={[
                    styles.planBadgeText,
                    isPaid ? styles.textPremium : styles.textFree,
                  ]}
                >
                  {isPaid ? "Premium Plan" : "Free Plan"}
                </Text>
              </View>
            </View>
          </View>

          {/* Conditional Upgrade Banner for Free Users */}
          {!isPaid && (
            <View style={styles.upgradeCard}>
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>Unlock All Content</Text>
                <Text style={styles.upgradeSubtitle}>
                  Get lifetime access to PYQ Papers Bank, Topicwise tests, and
                  future updates for just ₹99.
                </Text>
              </View>
              <Pressable
                style={styles.upgradeButton}
                onPress={() => router.push("/upgrade")}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade to Premium — ₹99
                </Text>
              </Pressable>
            </View>
          )}

          {/* About App Card (Tap to open popup) */}
          <Pressable
            style={styles.card}
            onPress={() => setAboutModalVisible(true)}
          >
            <View style={styles.rowBetween}>
              <View style={styles.labelGroup}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#2563eb"
                />
                <Text style={styles.cardTitle}>About App</Text>
              </View>
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>v2.0.0</Text>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            </View>
          </Pressable>

          {/* Sign Out Button */}
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* About App Modal Popup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalLogoBadge}>
                <Text style={styles.modalLogoText}>P</Text>
              </View>
              <Text style={styles.modalTitle}>PrepVault</Text>
              <Text style={styles.modalVersion}>Version 2.0.0</Text>
            </View>

            <Text style={styles.modalDescription}>
              PrepVault is specially designed for CUET PG Computer Science
              (SCQP09) aspirants. Access curated previous year question papers,
              topic-wise practice material, secure PDF viewing, and
              screen-sharing protections seamlessly.
            </Text>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push("/")}>
          <Ionicons name="home-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Home</Text>
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person" size={24} color="#2563eb" />
          <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  main: {
    width: "100%",
    maxWidth: 600,
    gap: 16,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  userInfoText: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#64748b",
  },
  rowBetween: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeFree: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  badgePremium: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  textFree: {
    color: "#b45309",
  },
  textPremium: {
    color: "#15803d",
  },
  upgradeCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 18,
    gap: 12,
  },
  upgradeTextContainer: {
    gap: 4,
  },
  upgradeTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1e293b",
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  upgradeButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  signOutButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  signOutText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalLogoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modalLogoText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalVersion: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  modalDescription: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalCloseButton: {
    backgroundColor: "#1e1b4b",
    borderRadius: 12,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  navTextActive: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
