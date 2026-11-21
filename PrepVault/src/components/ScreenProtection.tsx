import { usePreventScreenCapture } from 'expo-screen-capture';

export default function ScreenProtection() {
  usePreventScreenCapture();
  return null;
}
