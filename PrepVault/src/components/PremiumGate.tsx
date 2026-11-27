import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { usePremiumAccess } from "../context/PremiumAccessContext";

export default function PremiumGate() {
  const router = useRouter();
  const { status, refreshPremiumAccess } = usePremiumAccess();

  useEffect(() => {
    if (status === "unpaid") {
      router.replace("/upgrade" as any);
    }
  }, [status, router]);

  if (status === "loading" || status === "unpaid") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.text}>Checking premium access...</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Could not verify premium access.</Text>

        <Pressable style={styles.button} onPress={refreshPremiumAccess}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 12,
    padding: 24,
  },
  text: {
    color: "#334155",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
