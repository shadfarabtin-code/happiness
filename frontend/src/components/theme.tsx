import { ThemeProvider, createTheme } from "@rneui/themed";
import { useColorScheme } from "react-native";
import '@rneui/themed';

declare module '@rneui/themed' {
  export interface Colors {
    text: string;
    link: string;
  }
}

export const AppTheme = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();

    const theme = createTheme({
        lightColors: {
            background: '#F9FBFE',
            primary: '#F0F1F3',
            secondary: '#73a6d5',
            text: '#000000',
            link: "#55aaff",
        },
        darkColors: {
            background: '#101214',
            primary: '#191C1F',
            secondary: '#4a6a87',
            text: '#FFFFFF',
            link: "#55aaff",
        },
        mode: colorScheme === "dark" ? "dark" : "light",
        components: {
            Avatar: (props, theme) => ({
                containerStyle: {
                    backgroundColor: theme.colors?.grey4,
                    margin: 10
                }
            })
        },
    });
    return (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
    )
};