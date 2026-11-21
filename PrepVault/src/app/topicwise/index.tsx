
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ScreenProtection from '../../components/ScreenProtection';

const subjects = ['Maths', 'Computer', 'Reasoning'] as const;

const routes = {
  Maths: '/topicwise/maths',
  Computer: '/topicwise/computer',
  Reasoning: '/topicwise/reasoning',
} as const;

export default function TopicwiseIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenProtection />

      <View style={styles.main}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.heading}>Topicwise PYQs</Text>

        {subjects.map((subject) => (
          <Pressable
            key={subject}
            style={styles.item}
            onPress={() => router.push(routes[subject])}
          >
            <Text style={styles.itemText}>📁 {subject}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  main: {
    padding: 24,
    gap: 16,
  },

  back: {
    fontSize: 16,
    color: '#2563eb',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  item: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  itemText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
  },
});
