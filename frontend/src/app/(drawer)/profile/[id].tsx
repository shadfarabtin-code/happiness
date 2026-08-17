import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Avatar, Text, useTheme } from "@rneui/themed";
import MaterialIcons from "@react-native-vector-icons/material-icons";

import { useAuth } from "@/services/authContext";
import { getUser, startConversation, type UserOut } from "@/services/api";
import { ErrorText } from "@/components/Text";
import { PillButton } from "@/components/Buttons";

const AVATAR_SIZE = 96;
const BANNER_HEIGHT = 120;

const Profile = () => {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token } = useAuth();

    const [profile, setProfile] = useState<UserOut | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [messaging, setMessaging] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!id || !token) return;
        try {
            setError("");
            setProfile(await getUser(token, id));
        } catch (err) {
            console.error("Failed to load profile", err);
            setError("Couldn't load this profile.");
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [loadProfile])
    );

    async function handleMessage() {
        if (!token || !profile) return;
        setMessaging(true);
        try {
            setError("");
            const conversation = await startConversation(token, profile.email);
            router.push({ pathname: "/chat/[id]", params: { id: conversation.id } });
        } catch (err) {
            console.error("Failed to start conversation", err);
            setError("Couldn't start a conversation.");
        } finally {
            setMessaging(false);
        }
    }

    const isOwnProfile = !!user && !!profile && user.email === profile.email;
    const headline = profile
        ? [profile.role ? profile.role[0].toUpperCase() + profile.role.slice(1) : "", profile.company_name]
              .filter(Boolean)
              .join(" · ")
        : "";

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {error ? <View style={{ padding: 16, paddingBottom: 0 }}><ErrorText>{error}</ErrorText></View> : null}

            {profile && (
                <View>
                    {/* Banner */}
                    <View style={{ height: BANNER_HEIGHT, backgroundColor: theme.colors.secondary }} />

                    <View style={{ paddingHorizontal: 16 }}>
                        <Avatar
                            size={AVATAR_SIZE}
                            rounded
                            icon={{ name: "person", type: "material" }}
                            containerStyle={{
                                marginTop: -(AVATAR_SIZE / 2),
                                borderWidth: 4,
                                borderColor: theme.colors.background,
                            }}
                        />

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
                            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>
                                {profile.first_name} {profile.last_name}
                            </Text>
                            {profile.is_verified && (
                                <MaterialIcons name="verified" size={20} color={theme.colors.link} />
                            )}
                        </View>

                        {headline ? (
                            <Text style={{ color: theme.colors.grey2, fontSize: 15, marginTop: 4 }}>
                                {headline}
                            </Text>
                        ) : null}

                        <Text style={{ color: theme.colors.grey3, fontSize: 13, marginTop: 6 }}>
                            {profile.email}
                        </Text>

                        {!isOwnProfile && (
                            <View style={{ flexDirection: "row", marginTop: 16 }}>
                                <PillButton
                                    title={messaging ? "Starting..." : "Message"}
                                    icon={{ name: "chat-bubble-outline" }}
                                    onPress={handleMessage}
                                    disabled={messaging}
                                />
                            </View>
                        )}

                        <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.grey4, marginTop: 20, marginBottom: 12 }} />

                        <Text style={{ color: theme.colors.grey3, fontSize: 12 }}>User ID: {profile.id}</Text>
                    </View>
                </View>
            )}

            {!profile && !loading && !error ? (
                <View style={{ padding: 16 }}>
                    <Text>No profile found.</Text>
                </View>
            ) : null}
        </ScrollView>
    );
};

export default Profile;
