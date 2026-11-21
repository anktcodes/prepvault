
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/device';

type AccessState =
  | 'loading'
  | 'signedOut'
  | 'checking'
  | 'allowed';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [access, setAccess] = useState<AccessState>('loading');

  const router = useRouter();
  const segments = useSegments();

  // Listen for authentication changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verify the registered device
  useEffect(() => {
    if (!authReady) return;

    if (!session) {
      setAccess('signedOut');
      return;
    }

    let cancelled = false;

    async function verifyDevice() {
      try {
        setAccess('checking');

        const deviceId = await getDeviceId();

        const { data, error } = await supabase.rpc(
          'register_device',
          { p_device_id: deviceId }
        );

        if (error) throw error;

        if (cancelled) return;

        if (data === true) {
          setAccess('allowed');
        } else {
          Alert.alert(
            'Device not authorised',
            'This account is already registered on another device. Please contact the PrepVault administrator.'
          );

          await supabase.auth.signOut();
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Device verification failed:', error);

        Alert.alert(
          'Verification failed',
          'Could not verify your device. Please check your internet connection and sign in again.'
        );

        await supabase.auth.signOut();
      }
    }

    verifyDevice();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id, authReady]);

  // Control access to application routes
  useEffect(() => {
    if (access === 'loading' || access === 'checking') return;

    const isLoginScreen = segments[0] === 'login';

    if (access === 'signedOut' && !isLoginScreen) {
      router.replace('/login');
    } else if (access === 'allowed' && isLoginScreen) {
      router.replace('/');
    }
  }, [access, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
