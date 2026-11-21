
import { useState } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PdfView } from 'react-native-pdf-jsi';

import ScreenProtection from '../components/ScreenProtection';
import { PDF_FILES, PdfFolder } from '../constants/pdfFiles';

export default function ReaderScreen() {
  const router = useRouter();

  const { folder, file } = useLocalSearchParams<{
    folder: string;
    file: string;
  }>();

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const pdf = PDF_FILES[folder as PdfFolder]?.find(
    (item) => item.name === file
  );

  if (!pdf) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenProtection />
        <Text style={styles.error}>PDF not found.</Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenProtection />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>{file}</Text>

        <Text style={styles.pages}>
          {page}/{pageCount || '...'}
        </Text>
      </View>

      <PdfView
        style={styles.pdf}
        source={pdf.source}
        fitPolicy="width"
        onLoad={({ pageCount }) => setPageCount(pageCount)}
        onPageChange={({ page }) => setPage(page + 1)}
        onError={(error) => console.log('PDF Error:', error.message)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  back: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },

  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  pages: {
    fontSize: 14,
    color: '#64748b',
  },

  pdf: {
    flex: 1,
    width: '100%',
  },

  error: {
    fontSize: 18,
    padding: 24,
  },
});
