import { Animated, Easing, Pressable, View, useWindowDimensions } from "react-native";
import { Slot, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useTheme } from "@rneui/themed";
import { useAuth } from "@/services/authContext";


export default function DrawerLayout() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isWideScreen = useWindowDimensions().width >= 1024;
    const sidebarWidth = isWideScreen ? 260 : 200;
    const [sidebarOpen, setSidebarOpen] = useState(isWideScreen);

    const translateX = useRef(new Animated.Value(sidebarOpen ? 0 : -sidebarWidth+60)).current;

    useEffect(() => {
        setSidebarOpen(isWideScreen);
    }, [isWideScreen]);

    useEffect(() => {
        if (user === null) router.replace("/login");
    }, [user]);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: sidebarOpen ? 0 : -sidebarWidth+60,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [sidebarOpen, sidebarWidth, translateX]);

    return (
        <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            <Header onMenuPress={() => setSidebarOpen((prev) => !prev)} />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <Animated.View
                    style={[
                        isWideScreen
                            ? { width: sidebarWidth }
                            : { position: "absolute", top: 0, bottom: 0, left: 0, width: sidebarWidth, zIndex: 10 },
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <Sidebar toggle={() => setSidebarOpen((prev) => !prev)} />
                </Animated.View>

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