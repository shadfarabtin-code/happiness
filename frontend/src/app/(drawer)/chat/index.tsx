import { useCallback, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useTheme, Text } from "@rneui/themed";

import { useAuth } from "@/services/authContext";
import { getConversations, startConversation, type ConversationOut } from "@/services/api";
import { Heading, ErrorText } from "@/components/Text";
import { PillButton } from "@/components/Buttons";

const ConversationRow = ({ conversation, meEmail, onPress }: { conversation: ConversationOut; meEmail: string; onPress: () => void }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(false);
    const other = conversation.participants.find((p) => p !== meEmail) ?? conversation.participants[0];

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            style={{
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.grey4,
                backgroundColor: hovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
            }}
        >
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>{other}</Text>
        </Pressable>
    );
};

const ChatInbox = () => {
    const { theme } = useTheme();
    const { user, token } = useAuth();

    const [conversations, setConversations] = useState<ConversationOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [otherEmail, setOtherEmail] = useState("");
    const [starting, setStarting] = useState(false);

    const loadConversations = useCallback(async () => {
        if (!token) return;
        try {
            setError("");
            const data = await getConversations(token);
            setConversations(data);
        } catch (err) {
            console.error("Failed to load conversations", err);
            setError("Couldn't load conversations.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            loadConversations();
        }, [loadConversations])
    );

    async function handleStart() {
        if (!token || !otherEmail.trim()) return;
        setStarting(true);
        try {
            setError("");
            const conversation = await startConversation(token, otherEmail.trim());
            setOtherEmail("");
            router.push({ pathname: "/chat/[id]", params: { id: conversation.id } });
        } catch (err) {
            console.error("Failed to start conversation", err);
            setError(err instanceof Error ? err.message : "Couldn't start that conversation.");
        } finally {
            setStarting(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
            <Heading>Chat</Heading>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <TextInput
                    placeholder="Start a chat with an email..."
                    placeholderTextColor={theme.colors.grey3}
                    value={otherEmail}
                    onChangeText={setOtherEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: theme.colors.grey4,
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        color: theme.colors.text,
                    }}
                />
                <PillButton title={starting ? "Starting..." : "Start"} onPress={handleStart} disabled={starting} />
            </View>

            {error ? <ErrorText>{error}</ErrorText> : null}

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={loadConversations}
                ListEmptyComponent={!loading ? <ErrorText>No conversations yet.</ErrorText> : null}
                renderItem={({ item }) => (
                    <ConversationRow
                        conversation={item}
                        meEmail={user?.email ?? ""}
                        onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
                    />
                )}
            />
        </View>
    );
};

export default ChatInbox;
