
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ScreenProtection from '../components/ScreenProtection';

const years = ['2026', '2025', '2024', '2023', '2022'];

const subjects = ['Maths', 'Computer', 'Reasoning'];

function FolderList({ items }: { items: string[] }) {
  return (
    <View style={styles.folderList}>
      {items.map((item) => (
        <View key={item} style={styles.folder}>
          <Text style={styles.folderIcon}>📁</Text>
          <Text style={styles.folderName}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <>
    <ScreenProtection />
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.main}>

        {/* Section 1: PYQ Papers Bank */}
        <View style={styles.section}>
          <Text style={styles.heading}>
            PYQ Papers Bank
          </Text>

          <FolderList items={years} />
        </View>

        {/* Section 2: Topicwise PYQs */}
        <View style={styles.section}>
          <Text style={styles.heading}>
            Topicwise PYQs
          </Text>

          <FolderList items={subjects} />
        </View>

      </View>
    </ScrollView>

    </>
  
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

  folderList: {
    gap: 12,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
  },
});
