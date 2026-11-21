
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ScreenProtection from '../components/ScreenProtection';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenProtection />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.main}>

          <Pressable
            style={styles.section}
            onPress={() => router.push('/pyq')}
          >
            <Text style={styles.heading}>
              PYQ Papers Bank
            </Text>

            <View style={styles.folder}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text style={styles.folderName}>
                2026, 2025, 2024, 2023, 2022
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.section}
            onPress={() => router.push('/topicwise')}
          >
            <Text style={styles.heading}>
              Topicwise PYQs
            </Text>

            <View style={styles.folder}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text style={styles.folderName}>
                Maths, Computer, Reasoning
              </Text>
            </View>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  content: {
    alignItems: 'center',
    padding: 24,
  },

  main: {
    width: '100%',
    maxWidth: 600,
    gap: 36,
  },

  section: {
    gap: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  folder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },

  folderIcon: {
    fontSize: 26,
  },

  folderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
});
