import { Animated, Easing, Platform, Pressable, View, useWindowDimensions } from "react-native";
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
    // Wide screens collapse to a 50px icon rail, so they only need to slide over by
    // (sidebarWidth - 50). Mobile has no rail — it's an absolute-positioned drawer that
    // should slide fully off-screen, i.e. by the whole sidebarWidth.
    const closedOffset = isWideScreen ? -sidebarWidth + 50 : -sidebarWidth;
    const [sidebarOpen, setSidebarOpen] = useState(isWideScreen);

    const translateX = useRef(new Animated.Value(sidebarOpen ? 0 : closedOffset)).current;
    const boxWidth = useRef(new Animated.Value(sidebarOpen ? sidebarWidth : 50)).current;

    useEffect(() => {
        setSidebarOpen(isWideScreen);
    }, [isWideScreen]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: sidebarOpen ? 0 : closedOffset,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: Platform.OS !== "web",
            }),
            // Width can't run on the native driver, but it's what actually frees up
            // layout space for the content next to it — translateX alone is just a
            // visual shift and leaves the row's reserved width untouched.
            Animated.timing(boxWidth, {
                toValue: sidebarOpen ? sidebarWidth : 50,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    }, [sidebarOpen, sidebarWidth, closedOffset, translateX, boxWidth]);

    return (
        <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            <Header onMenuPress={() => setSidebarOpen((prev) => !prev)} />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <Animated.View
                    style={[
                        isWideScreen
                            ? { width: boxWidth }
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