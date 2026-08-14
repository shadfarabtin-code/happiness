import { useAuth } from "@/services/authContext";
import { useState } from "react";
import { router } from "expo-router";

import { View } from "react-native";
import { Avatar, ListItem, Overlay, useTheme } from "@rneui/themed";
import { OptionButton } from "@/components/Buttons";
import { logout } from "@/services/api";

export const UserSettings = () => {
    const [active, isActive] = useState(false);
    const { user, token, setAuth } = useAuth();
    const { theme } = useTheme();

    async function handleLogout() {
        if (token) {
            // Best-effort: invalidate the session server-side so a leaked token can't be reused.
            // Still log out locally even if this fails (e.g. offline).
            await logout(token).catch((err) => console.error("Failed to invalidate session", err));
        }
        setAuth(null, null);
        router.replace("/login");
    }

    return (
        <>
            <Avatar containerStyle={{ margin: 10 }}
                rounded
                size="small"
                icon={{ name: "person", type: "material" }}
                onPress={() => user ? isActive(true) : router.replace("/login")}
            />
            <Overlay
                isVisible={active}
                onBackdropPress={() => isActive(false)}
                backdropStyle={{ backgroundColor: "transparent" }}
                overlayStyle={{
                    borderRadius: 15,
                    backgroundColor: theme.colors.primary,
                    position: "absolute",
                    top: 50,
                    right: 15,
                    margin: 0,
                    width: 200,
                }}
            >
                <View style={{ flexDirection: "row" }}>
                    <Avatar containerStyle={{ margin: 0 }}
                        rounded
                        size="medium"
                        icon={{ name: "person", type: "material" }}
                        onPress={() => isActive(true)}
                    />
                    <ListItem containerStyle={{ paddingTop: 5, backgroundColor: "transparent" }}>
                        <ListItem.Content>
                            <ListItem.Title style={{ marginBottom: 5 }}>{user?.first_name + " " + user?.last_name}</ListItem.Title>
                            <ListItem.Subtitle>{user?.company_name}</ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem>
                </View>
                <OptionButton title="Log Out" onPress={() => handleLogout()} />
            </Overlay>
        </>
    );
};