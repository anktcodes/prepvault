
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ScreenProtection from './ScreenProtection';
import { PDF_FILES, PdfFolder } from '../constants/pdfFiles';

type Props = {
  folder: PdfFolder;
  title: string;
};

export default function PdfFolderScreen({ folder, title }: Props) {
  const router = useRouter();
  const files = PDF_FILES[folder];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenProtection />

      <View style={styles.main}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.heading}>{title}</Text>

        <View style={styles.list}>
          {files.map((pdf) => (
            <Pressable
              key={pdf.name}
              style={styles.file}
              onPress={() =>
                router.push({
                  pathname: '/reader',
                  params: {
                    folder,
                    file: pdf.name,
                  },
                })
              }
            >
              <Text style={styles.icon}>📄</Text>
              <Text style={styles.fileName}>{pdf.name}</Text>
            </Pressable>
          ))}
        </View>
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
    gap: 24,
  },

  back: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  list: {
    gap: 12,
  },

  file: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },

  icon: {
    fontSize: 25,
  },

  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
});
