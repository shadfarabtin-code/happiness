import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Input, useTheme } from "@rneui/themed";

import { useAuth } from "@/services/authContext";
import { getThreadTree, postMessage, type MessageNode } from "@/services/api";
import { ErrorText, HyperlinkText } from "@/components/Text";
import { SelectionButton } from "@/components/Buttons";

type Row = { node: MessageNode; depth: number };

function flatten(nodes: MessageNode[], depth = 0): Row[] {
    return nodes.flatMap((node) => [{ node, depth }, ...flatten(node.replies, depth + 1)]);
}

const ThreadDetail = () => {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token } = useAuth();

    const [tree, setTree] = useState<MessageNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [replyBody, setReplyBody] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [posting, setPosting] = useState(false);

    const loadTree = useCallback(async () => {
        if (!id) return;
        try {
            setError("");
            setTree(await getThreadTree(id));
        } catch (err) {
            console.error("Failed to load thread", err);
            setError("Couldn't load this thread.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            loadTree();
        }, [loadTree])
    );

    async function handleReply() {
        if (!id || !token) return;
        if (!replyBody.trim()) {
            setError("Write a message first.");
            return;
        }
        setPosting(true);
        try {
            setError("");
            await postMessage(token, id, replyBody.trim(), replyTo);
            setReplyBody("");
            setReplyTo(null);
            await loadTree();
        } catch (err) {
            console.error("Failed to post message", err);
            setError("Couldn't post that message.");
        } finally {
            setPosting(false);
        }
    }

    const rows = flatten(tree);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
            <FlatList
                data={rows}
                keyExtractor={({ node }) => node.id}
                refreshing={loading}
                onRefresh={loadTree}
                ListEmptyComponent={!loading ? <ErrorText>No messages yet.</ErrorText> : null}
                renderItem={({ item }) => (
                    <View style={{ marginLeft: item.depth * 20, marginBottom: 12 }}>
                        <Text style={{ color: theme.colors.grey3, fontSize: 12 }}>{item.node.author_email}</Text>
                        <Text style={{ color: theme.colors.text }}>{item.node.body}</Text>
                        {user && (
                            <HyperlinkText onPress={() => setReplyTo(item.node.id)}>Reply</HyperlinkText>
                        )}
                    </View>
                )}
            />

            {user && (
                <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.grey4, paddingTop: 12, gap: 8 }}>
                    {replyTo && (
                        <HyperlinkText onPress={() => setReplyTo(null)}>Replying to a message — cancel</HyperlinkText>
                    )}
                    <Input placeholder="Write a reply..." value={replyBody} onChangeText={setReplyBody} />
                    <SelectionButton title={posting ? "Posting..." : "Reply"} onPress={handleReply} />
                </View>
            )}

            {error ? <ErrorText>{error}</ErrorText> : null}
        </View>
    );
};

export default ThreadDetail;
