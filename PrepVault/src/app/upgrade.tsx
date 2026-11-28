import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import {
  createPaymentOrder,
  verifyPayment,
  type RazorpayOrder,
  type RazorpayPaymentResponse,
} from "../lib/payments";
import { supabase } from "../lib/supabase";

// Extend window type for WebView communication
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

type CheckoutMessage =
  | { type: "success"; payload: RazorpayPaymentResponse }
  | { type: "cancel" }
  | { type: "failure"; message?: string };

const OFFERINGS = [
  {
    title: "All CUET PG SCQP09 PYQs",
    subtitle: "Complete year-wise archive (2022–2026) in one place",
  },
  {
    title: "15 Topic-Wise Tests",
    subtitle: "Focused practice on the most important & high-weightage topics",
  },
  {
    title: "Actual PYQs & Exam-Level Difficulty",
    subtitle: "Real exam pattern questions calibrated for DU & JNU targets",
  },
  {
    title: "Upcoming Questions Practice",
    subtitle: "Free access to all new practice sets and papers added later",
  },
  {
    title: "Distraction-Free In-App Reader",
    subtitle: "Fast, clean PDF viewing designed for serious revision",
  },
];

function buildCheckoutHtml(order: RazorpayOrder, email?: string) {
  const config = {
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    name: "PrepVault",
    description: "Lifetime Premium Access",
    order_id: order.order_id,
    prefill: { email: email || "" },
    theme: { color: "#1e1b4b" },
    modal: {
      ondismiss: function () {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "cancel" }),
          );
        }
      },
    },
  };

  const configJson = JSON.stringify(config).replace(/</g, "\\u003c");

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
<script>
const options = ${configJson};
options.handler = function (response) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'success',
      payload: response
    }));
  }
};
const checkout = new Razorpay(options);
checkout.on('payment.failed', function (response) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'failure',
      message: response.error.description || 'Payment failed'
    }));
  }
});
checkout.open();
</script>
</body>
</html>`;
}

export default function UpgradeScreen() {
  const router = useRouter();
  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function startPayment() {
    try {
      setLoading(true);
      const newOrder = await createPaymentOrder();
      const { data } = await supabase.auth.getUser();
      setCheckoutHtml(buildCheckoutHtml(newOrder, data.user?.email));
    } catch (error) {
      Alert.alert(
        "Unable to start payment",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleWebViewMessage(message: string) {
    let result: CheckoutMessage;
    try {
      result = JSON.parse(message);
    } catch {
      return;
    }

    if (result.type === "cancel") {
      setCheckoutHtml("");
      return;
    }

    if (result.type === "failure") {
      setCheckoutHtml("");
      Alert.alert("Payment failed", result.message || "Please try again.");
      return;
    }

    if (result.type === "success") {
      try {
        setVerifying(true);
        await verifyPayment(result.payload);
        setCompleted(true);
        setCheckoutHtml("");
        Alert.alert(
          "Payment successful",
          "Your payment has been verified. Lifetime Premium access is now unlocked!",
        );
      } catch (error) {
        Alert.alert(
          "Verification failed",
          error instanceof Error
            ? error.message
            : "Contact support before attempting another payment.",
        );
      } finally {
        setVerifying(false);
      }
    }
  }

  if (checkoutHtml) {
    return (
      <SafeAreaView style={styles.container}>
        {verifying && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.statusText}>Verifying payment...</Text>
          </View>
        )}
        <WebView
          source={{
            html: checkoutHtml,
            baseUrl: "https://checkout.razorpay.com",
          }}
          originWhitelist={["https://*", "http://*"]}
          javaScriptEnabled
          domStorageEnabled
          onMessage={(event) => handleWebViewMessage(event.nativeEvent.data)}
          onError={() => {
            setCheckoutHtml("");
            Alert.alert("Checkout error", "Could not load Razorpay Checkout.");
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()} style={styles.topBackButton}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
          <Text style={styles.topBackText}>Back</Text>
        </Pressable>
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={14} color="#fbbf24" />
          <Text style={styles.headerBadgeText}>PREP VAULT PRO</Text>
        </View>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <Text style={styles.headerSubtitle}>
          Everything you need to crack CUET PG Computer Science (SCQP09)
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          <View style={styles.priceCard}>
            <View style={styles.lifetimePill}>
              <Text style={styles.lifetimePillText}>
                ONE-TIME PAYMENT • LIFETIME ACCESS
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.priceAmount}>99</Text>
              <Text style={styles.priceNote}>/ forever</Text>
            </View>
            <Text style={styles.priceSubnote}>
              No monthly renewals. Pay once and unlock all current & future
              papers.
            </Text>
          </View>

          <View style={styles.offeringsCard}>
            <Text style={styles.sectionTitle}>What we offer</Text>
            <View style={styles.offeringsList}>
              {OFFERINGS.map((item, index) => (
                <View key={index} style={styles.offeringRow}>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={16} color="#15803d" />
                  </View>
                  <View style={styles.offeringTextGroup}>
                    <Text style={styles.offeringTitle}>{item.title}</Text>
                    <Text style={styles.offeringSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {completed ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={28} color="#15803d" />
              <Text style={styles.successTitle}>Premium Unlocked!</Text>
              <Text style={styles.successSubtitle}>
                Head back to the home screen to access all PYQs and tests.
              </Text>
              <Pressable
                style={styles.button}
                onPress={() => router.replace("/")}
              >
                <Text style={styles.buttonText}>Start Practicing</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.ctaContainer}>
              <Pressable
                style={styles.button}
                onPress={startPayment}
                disabled={loading || verifying}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Ionicons
                      name="lock-open-outline"
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.buttonText}>
                      Unlock Everything for ₹99
                    </Text>
                  </View>
                )}
              </Pressable>

              <View style={styles.trustRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color="#64748b"
                />
                <Text style={styles.trustText}>
                  Instant activation • 100% Secure payment via Razorpay (UPI,
                  Cards)
                </Text>
              </View>

              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Text style={styles.backText}>Maybe later</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerContainer: {
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginBottom: 12,
  },
  topBackText: { color: "#e2e8f0", fontSize: 15, fontWeight: "600" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 13, color: "#94a3b8", lineHeight: 18 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  main: { width: "100%", maxWidth: 600, gap: 18, alignSelf: "center" },
  priceCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 20,
    alignItems: "center",
  },
  lifetimePill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fcd34d",
    marginBottom: 12,
  },
  lifetimePillText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#b45309",
    letterSpacing: 0.5,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline" },
  currencySymbol: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b",
    marginRight: 2,
  },
  priceAmount: { fontSize: 48, fontWeight: "bold", color: "#1e293b" },
  priceNote: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },
  priceSubnote: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  offeringsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  offeringsList: { gap: 16 },
  offeringRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  offeringTextGroup: { flex: 1, gap: 2 },
  offeringTitle: { fontSize: 15, fontWeight: "bold", color: "#1e293b" },
  offeringSubtitle: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  ctaContainer: { gap: 10, marginTop: 4 },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "bold" },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  trustText: { fontSize: 12, color: "#64748b", textAlign: "center" },
  backButton: { paddingVertical: 10, alignItems: "center" },
  backText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  successBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  successTitle: { fontSize: 18, fontWeight: "bold", color: "#15803d" },
  successSubtitle: {
    fontSize: 13,
    color: "#166534",
    textAlign: "center",
    marginBottom: 8,
  },
  overlay: {
    position: "absolute",
    zIndex: 2,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffffee",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: { marginTop: 12, color: "#1e293b", fontWeight: "600" },
});
