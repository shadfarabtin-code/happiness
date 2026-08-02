import { Pressable, View, useWindowDimensions } from "react-native";
import { Slot } from "expo-router";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useTheme } from "@rneui/themed";


export default function DrawerLayout() {
    const { theme } = useTheme();
    const isWideScreen = useWindowDimensions().width >= 1024;
    const sidebarWidth = isWideScreen ? 260 : 200;
    const [sidebarOpen, setSidebarOpen] = useState(isWideScreen);

    useEffect(() => {
        setSidebarOpen(isWideScreen);
    }, [isWideScreen]);

    return (
        <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            <Header onMenuPress={() => setSidebarOpen((prev) => !prev)} />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <View
                    style={[
                        isWideScreen
                            ? { width: sidebarWidth }
                            : { position: "absolute", top: 0, bottom: 0, left: 0, width: sidebarWidth, zIndex: 10 },
                        {
                            transform: [{ translateX: sidebarOpen ? 0 : -200 }],
                        },
                    ]}
                >
                    <Sidebar toggle={() => setSidebarOpen((prev) => !prev)} />
                </View>

                {!isWideScreen && sidebarOpen && (
                    <Pressable
                        style={{ position: "absolute", top: 0, bottom: 0, left: 200, right: 0, zIndex: 5, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                        onPress={() => setSidebarOpen(false)}
                    />
                )}

                <View style={{ flex: 1 }}>
                    <Slot />
                </View>
            </View>
        </View>
    );
}