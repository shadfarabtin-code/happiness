import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useTheme } from "@rneui/themed";
import { Chat, type IMessage } from "@kesha-antonov/react-native-chat";
import MaterialIcons from "@react-native-vector-icons/material-icons";

import { useAuth } from "@/services/authContext";
import { getConversation, getConversationMessages, sendChatMessage, type ChatMessageOut, type ConversationOut } from "@/services/api";
import { ErrorText } from "@/components/Text";

const POLL_INTERVAL_MS = 4000;

// Messages only carry a sender_email; the sender's display name (and, later, avatar/photo)
// comes from whichever of "me" or the conversation's other_user that email matches.
function toIMessage(m: ChatMessageOut, resolveName: (email: string) => string): IMessage {
    return {
        _id: m.id,
        text: m.body,
        createdAt: new Date(m.created_at * 1000),
        user: { _id: m.sender_email, name: resolveName(m.sender_email) },
    };
}

const ConversationDetail = () => {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token } = useAuth();

    const [conversation, setConversation] = useState<ConversationOut | null>(null);
    const [rawMessages, setRawMessages] = useState<ChatMessageOut[]>([]);
    // Optimistic sends: shown immediately, cleared once loadMessages() has re-fetched and
    // picked up the real (server-confirmed) copy — see onSend.
    const [pending, setPending] = useState<IMessage[]>([]);
    const [error, setError] = useState("");

    // Only depends on id/token, so it stays referentially stable across polls — nothing here
    // should trigger the focus effect below to tear down and restart its interval.
    const loadConversation = useCallback(async () => {
        if (!id || !token) return;
        try {
            setConversation(await getConversation(token, id));
        } catch (err) {
            console.error("Failed to load conversation", err);
        }
    }, [id, token]);

    const loadMessages = useCallback(async () => {
        if (!id || !token) return;
        try {
            setError("");
            setRawMessages(await getConversationMessages(token, id));
        } catch (err) {
            console.error("Failed to load messages", err);
            setError("Couldn't load this conversation.");
        }
    }, [id, token]);

    // Polls while the screen is focused so incoming replies show up without a manual refresh —
    // there's no websocket/push layer yet, so this is the cheap stand-in for "live".
    useFocusEffect(
        useCallback(() => {
            loadConversation();
            loadMessages();
            const interval = setInterval(loadMessages, POLL_INTERVAL_MS);
            return () => clearInterval(interval);
        }, [loadConversation, loadMessages])
    );

    const resolveName = useCallback((email: string): string => {
        if (user && email === user.email) return `${user.first_name} ${user.last_name}`.trim() || email;
        if (conversation && email === conversation.other_user.email) {
            return `${conversation.other_user.first_name} ${conversation.other_user.last_name}`.trim() || email;
        }
        return email;
    }, [user, conversation]);

    // Chat wants newest-first (it renders as an inverted list); the API gives oldest-first.
    // Pending (optimistic) messages are always the newest, so they go first.
    const messages = useMemo(
        () => [...pending, ...[...rawMessages].reverse().map((m) => toIMessage(m, resolveName))],
        [pending, rawMessages, resolveName]
    );

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        const [outgoing] = newMessages;
        if (!id || !token || !outgoing) return;

        setPending((prev) => [...prev, outgoing]);

        try {
            setError("");
            await sendChatMessage(token, id, String(outgoing.text));
            await loadMessages(); // refresh from server; rawMessages now includes the real copy
        } catch (err) {
            console.error("Failed to send message", err);
            setError("Couldn't send that message.");
        } finally {
            setPending((prev) => prev.filter((m) => m._id !== outgoing._id));
        }
    }, [id, token, loadMessages]);

    if (!user) return null;

    // Both light and dark overrides are pinned to the app's currently-resolved background
    // (rather than duplicating the app's separate light/dark palettes here), so the chat
    // surface matches regardless of which mode Chat's own color-scheme detection picks.
    const chatThemeOverride = {
        colors: {
            background: theme.colors.background,
            inputBarBackground: theme.colors.background,
        },
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {error ? <ErrorText>{error}</ErrorText> : null}
            <Chat
                messages={messages}
                onSend={onSend}
                user={{ _id: user.email, name: `${user.first_name} ${user.last_name}`.trim() }}
                theme={chatThemeOverride}
                darkTheme={chatThemeOverride}
                icons={{
                    send: ({ color, size }) => <MaterialIcons name="keyboard-return" size={size} color={color} />,
                }}
            />
        </View>
    );
};

export default ConversationDetail;
