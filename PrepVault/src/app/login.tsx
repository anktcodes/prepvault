
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import ScreenProtection from '../components/ScreenProtection';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = 'prepvault://google-auth';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });

      if (error) throw error;
      if (!data.url) throw new Error('Could not start Google login.');

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === 'success') {
        const params = Linking.parse(result.url).queryParams;
        const code = params?.code;

        if (typeof code !== 'string') {
          throw new Error(
            'Google login did not return an authorization code.'
          );
        }

        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) throw exchangeError;
      }
    } catch (error: any) {
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenProtection />

      <Text style={styles.title}>PrepVault</Text>
      <Text style={styles.subtitle}>
        Your CUET PG preparation library
      </Text>

      <Pressable
        style={styles.button}
        onPress={signInWithGoogle}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            Continue with Google
          </Text>
        )}
      </Pressable>

      <Text style={styles.footer}>
        Sign in to access your study materials.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#208AEF',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginTop: 10,
    marginBottom: 45,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    color: '#888888',
    marginTop: 25,
    fontSize: 13,
  },
});
