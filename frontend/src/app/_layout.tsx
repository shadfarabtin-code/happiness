import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, createTheme } from "@rneui/themed";
import { AuthProvider } from "@/services/authContext";

import { Button } from "@rneui/base";

const theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
    secondary: '#73a6d5',
  },
  darkColors: {
    primary: '#000',
    secondary: '#4a6a87',
  },
  components: {
    Avatar: (props, theme) => ({
      containerStyle: {
        backgroundColor: theme.colors?.grey4,
        margin: 10
      }
    }),
    Button: (props, theme) => ({
      buttonStyle: {
        backgroundColor: theme.colors?.secondary,
        borderRadius: 8,
        paddingVertical: 12,
      },
      titleStyle: {
        fontWeight: "600",
        fontSize: 16,
      },
    }),
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <Stack />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
