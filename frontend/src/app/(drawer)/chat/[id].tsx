import { useCallback, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useTheme, Text } from "@rneui/themed";

import { useAuth } from "@/services/authContext";
import { getConversationMessages, sendChatMessage, type ChatMessageOut } from "@/services/api";
import { timeAgo } from "@/services/threadContext";
import { ErrorText } from "@/components/Text";
import { PillButton } from "@/components/Buttons";

const MessageRow = ({ message, mine }: { message: ChatMessageOut; mine: boolean }) => {
    const { theme } = useTheme();

    return (
        <View style={{ marginBottom: 12, alignItems: mine ? "flex-end" : "flex-start" }}>
            <Text style={{ color: theme.colors.grey3, fontSize: 12 }}>
                {message.sender_email} · {timeAgo(message.created_at)}
            </Text>
            <View
                style={{
                    marginTop: 4,
                    maxWidth: "75%",
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: mine ? theme.colors.secondary : theme.colors.grey5,
                }}
            >
                <Text style={{ color: theme.colors.text }}>{message.body}</Text>
            </View>
        </View>
    );
};

const ConversationDetail = () => {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token } = useAuth();

    const [messages, setMessages] = useState<ChatMessageOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);

    const loadMessages = useCallback(async () => {
        if (!id || !token) return;
        try {
            setError("");
            const data = await getConversationMessages(token, id);
            setMessages(data);
        } catch (err) {
            console.error("Failed to load messages", err);
            setError("Couldn't load this conversation.");
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useFocusEffect(
        useCallback(() => {
            loadMessages();
        }, [loadMessages])
    );

    async function handleSend() {
        if (!id || !token || !body.trim()) return;
        setSending(true);
        try {
            setError("");
            await sendChatMessage(token, id, body.trim());
            setBody("");
            await loadMessages();
        } catch (err) {
            console.error("Failed to send message", err);
            setError("Couldn't send that message.");
        } finally {
            setSending(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={loadMessages}
                ListEmptyComponent={!loading ? <Text>No messages yet. Say hello!</Text> : null}
                renderItem={({ item }) => <MessageRow message={item} mine={item.sender_email === user?.email} />}
            />

            {error ? <ErrorText>{error}</ErrorText> : null}

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.grey4,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                }}
            >
                <TextInput
                    placeholder="Message..."
                    placeholderTextColor={theme.colors.grey3}
                    value={body}
                    onChangeText={setBody}
                    style={{ flex: 1, color: theme.colors.text, paddingVertical: 10 }}
                />
                <PillButton title={sending ? "Sending..." : "Send"} onPress={handleSend} disabled={sending} />
            </View>
        </View>
    );
};

export default ConversationDetail;
