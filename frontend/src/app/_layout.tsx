import { Slot } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTheme } from "@/components/Theme";
import { AuthProvider } from "@/services/authContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppTheme>
          <title>Happiness</title>
          <Slot/>
        </AppTheme>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
