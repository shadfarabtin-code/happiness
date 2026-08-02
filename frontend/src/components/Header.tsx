import { useWindowDimensions, View } from "react-native";
import { Icon, Text, useTheme } from "@rneui/themed";
import { router } from "expo-router";

import {UserSettings} from "@/components/UserSetttings";

export const Header = ({ onMenuPress }: { onMenuPress: () => void }) => {
    const { theme } = useTheme();
    const isWideScreen = useWindowDimensions().width >= 1024;

    return (
        <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: theme.colors?.grey4 }}>
            {!isWideScreen && (
                <Icon name="menu" type="material" onPress={onMenuPress} size={30} containerStyle={{ marginRight: 10 }} />
            )}
            <Text style={{ marginLeft: 5, fontSize: 24, fontWeight: "bold" }} onPress={() => { router.navigate("/home") }}>
                Happiness
            </Text>
            <View style={{ marginLeft: "auto" }}>
                <UserSettings/>
            </View>
        </View>
    );
};