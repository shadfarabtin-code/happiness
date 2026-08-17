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
                    {/* RNEUI's ListItem renders an unstyled outer View around its padded content, so
                        flex/minWidth on containerStyle alone doesn't reach the actual row flex item —
                        this wrapper is what lets the text shrink instead of pushing the overlay wider. */}
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <ListItem containerStyle={{ paddingTop: 5, backgroundColor: "transparent" }}>
                            <ListItem.Content style={{ minWidth: 0 }}>
                                <ListItem.Title
                                    style={{ marginBottom: 5, width: "100%" }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {user?.first_name + " " + user?.last_name}
                                </ListItem.Title>
                                <ListItem.Subtitle
                                    style={{ width: "100%" }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {user?.company_name}
                                </ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    </View>
                </View>
                <OptionButton
                    title="Profile"
                    icon={{ name: "person" }}
                    onPress={() => {
                        if (!user) return;
                        isActive(false);
                        router.push({ pathname: "/profile/[id]", params: { id: user.email } });
                    }}
                />
                <OptionButton title="Log Out" icon={{ name: "sensor-door" }} onPress={() => handleLogout()} />
            </Overlay>
        </>
    );
};