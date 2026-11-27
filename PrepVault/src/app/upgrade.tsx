import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { usePremiumAccess } from "../context/PremiumAccessContext";
import { supabase } from "../lib/supabase";

import {
  createPaymentOrder,
  verifyPayment,
  type RazorpayOrder,
  type RazorpayPaymentResponse,
} from "../lib/payments";

type CheckoutMessage =
  | { type: "success"; payload: RazorpayPaymentResponse }
  | { type: "cancel" }
  | { type: "failure"; message?: string };

function buildCheckoutHtml(order: RazorpayOrder, email?: string) {
  const config = {
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    name: "PrepVault",
    description: "Lifetime Premium Access",
    order_id: order.order_id,
    prefill: { email: email || "" },
    theme: { color: "#2563eb" },
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
            (window).ReactNativeWebView.postMessage(JSON.stringify({
              type: 'success',
              payload: response
            }));
          };

          options.modal = {
            ondismiss: function () {
              (window).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'cancel'
              }));
            }
          };

          const checkout = new Razorpay(options);

          checkout.on('payment.failed', function (response) {
            (window).ReactNativeWebView.postMessage(JSON.stringify({
              type: 'failure',
              message: response.error.description || 'Payment failed'
            }));
          });

          checkout.open();
        </script>
      </body>
    </html>
  `;
}

export default function UpgradeScreen() {
  const router = useRouter();
  const { refreshPremiumAccess } = usePremiumAccess();

  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function startPayment() {
    try {
      setLoading(true);

      const newOrder = await createPaymentOrder();

      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

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

      Alert.alert("Payment cancelled", "No payment was verified.");

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
        await refreshPremiumAccess();

        setCompleted(true);
        setCheckoutHtml("");

        Alert.alert(
          "Payment successful",
          "Your payment has been verified and premium access has been activated.",
        );
      } catch (error) {
        Alert.alert(
          "Verification failed",
          error instanceof Error
            ? error.message
            : "Please contact support before attempting another payment.",
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PrepVault Premium</Text>

        <Text style={styles.price}>₹99</Text>

        <Text style={styles.subtitle}>One-time payment. Lifetime access.</Text>

        <View style={styles.features}>
          <Text style={styles.feature}>• PYQ Papers Bank</Text>

          <Text style={styles.feature}>• Topicwise PYQs</Text>

          <Text style={styles.feature}>• Future premium content</Text>
        </View>

        {completed ? (
          <Text style={styles.success}>Payment verified successfully.</Text>
        ) : (
          <Pressable
            style={styles.button}
            onPress={startPayment}
            disabled={loading || verifying}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Pay ₹99</Text>
            )}
          </Pressable>
        )}

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Go back</Text>
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

  content: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },

  price: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
    marginTop: 24,
  },

  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },

  features: {
    gap: 16,
    marginVertical: 36,
  },

  feature: {
    fontSize: 17,
    color: "#334155",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  backButton: {
    padding: 16,
    alignItems: "center",
  },

  backText: {
    color: "#64748b",
    fontSize: 15,
  },

  success: {
    color: "#15803d",
    textAlign: "center",
    fontWeight: "600",
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

  statusText: {
    marginTop: 12,
    color: "#1e293b",
  },
});
