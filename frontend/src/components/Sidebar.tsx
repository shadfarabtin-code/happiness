import { useWindowDimensions, View } from "react-native";
import { router } from "expo-router";

import { OptionButton } from "@/components/Buttons";
import { Icon } from "@rneui/themed";
import { useTheme } from "@rneui/themed";

const SidebarContent = ({ width }: { width: number }) => {
    const { theme } = useTheme();
    return (
        <View style={{  width, borderRightWidth: 1, borderRightColor: theme.colors.grey4, padding: 16, flex: 1 }}>
            <OptionButton title="Home" onPress={() => router.navigate("/home")} />
        </View>
    );
}

export const Sidebar = ({ toggle }: { toggle: () => void }) => {
    const { theme } = useTheme();
    const isWideScreen = useWindowDimensions().width >= 1024;
    const sidebarWidth = isWideScreen ? 260 : 200;
    const contentWidth = isWideScreen ? sidebarWidth - 20 : sidebarWidth;

    return (
        <View style={{ width: sidebarWidth, flex: 1 }}>
            <SidebarContent width={contentWidth} />
            {isWideScreen && (<View
                style={{
                    position: "absolute",
                    top: 20,
                    left: 225,
                    zIndex: 10,
                    width: 30,
                    height: 30,
                    borderRadius: 17.5,
                    borderWidth: 1,
                    borderColor: theme.colors.grey4,
                    backgroundColor: theme.colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon name="menu" type="material" onPress={toggle} size={18} color={theme.colors.text} containerStyle={{ zIndex: 11 }} />
            </View>)}
        </View>
    );
};