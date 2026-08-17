import { useCallback, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useTheme, Text } from "@rneui/themed";

import { useAuth } from "@/services/authContext";
import { getThreads, getThreadTree, postMessage, type MessageNode } from "@/services/api";
import { flatten, countDescendants, timeAgo, authorName } from "@/services/threadContext";
import { ErrorText, Tag } from "@/components/Text";
import { PillButton } from "@/components/Buttons";

const ReplyComposer = ({
    placeholder,
    value,
    onChangeText,
    onCancel,
    onSubmit,
    submitting,
}: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
    submitting: boolean;
}) => {
    const { theme } = useTheme();

    return (
        <View style={{
            borderWidth: 1,
            borderColor: theme.colors.grey4,
            borderRadius: 16,
            padding: 12,
            marginTop: 20,
            gap: 8,
        }}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={theme.colors.grey3}
                value={value}
                onChangeText={onChangeText}
                multiline
                style={{ color: theme.colors.text, fontSize: 15, minHeight: 40 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                <PillButton title="Cancel" onPress={onCancel} />
                <PillButton title={submitting ? "Posting..." : "Comment"} onPress={onSubmit} disabled={submitting} />
            </View>
        </View>
    );
};

const ThreadDetail = () => {
    const { theme } = useTheme();
    const params = useLocalSearchParams<{ id: string; title?: string; tags?: string }>();
    const { id } = params;
    const { user, token } = useAuth();

    const [threadTitle, setThreadTitle] = useState(params.title ?? "");
    const [threadTags, setThreadTags] = useState<string[]>(
        params.tags ? params.tags.split(",").filter(Boolean) : []
    );

    const [tree, setTree] = useState<MessageNode[]>([]);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [topReplyBody, setTopReplyBody] = useState("");
    const [activeReplyTarget, setActiveReplyTarget] = useState<string | null>(null);
    const [activeReplyBody, setActiveReplyBody] = useState("");
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

    // Falls back to fetching thread metadata when it wasn't passed via navigation params (e.g. a direct link/refresh)
    const loadThreadMeta = useCallback(async () => {
        if (!id || params.title) return;
        try {
            const threads = await getThreads();
            const match = threads.find((t) => t.id === id);
            if (match) {
                setThreadTitle(match.title);
                setThreadTags(match.tags);
            }
        } catch (err) {
            console.error("Failed to load thread info", err);
        }
    }, [id, params.title]);

    useFocusEffect(
        useCallback(() => {
            loadTree();
            loadThreadMeta();
        }, [loadTree, loadThreadMeta])
    );

    function toggleCollapse(nodeId: string) {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    }

    // The thread creator's first message is the OP post; everything else nests under it as comments
    const opMessage = tree[0] ?? null;
    const commentRoots = opMessage ? [...opMessage.replies, ...tree.slice(1)] : tree;
    const rows = flatten(commentRoots, collapsed);

    async function submitReply(parentId: string | null, body: string, onDone: () => void) {
        if (!id || !token) return;
        if (!body.trim()) {
            setError("Write a message first.");
            return;
        }
        setPosting(true);
        try {
            setError("");
            await postMessage(token, id, body.trim(), parentId);
            onDone();
            await loadTree();
        } catch (err) {
            console.error("Failed to post message", err);
            setError("Couldn't post that message.");
        } finally {
            setPosting(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
            {threadTitle ? (
                <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "700" }}>
                    {threadTitle}
                </Text>
            ) : null}

            {threadTags.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {threadTags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                </View>
            )}

            {opMessage && (
                <View style={{ marginTop: 12 }}>
                    <Text style={{ color: theme.colors.grey3, fontSize: 12 }}>
                        Posted by {authorName(opMessage)} · {timeAgo(opMessage.created_at)}
                    </Text>
                    {opMessage.body ? (
                        <Text style={{ color: theme.colors.text, fontSize: 16, marginTop: 6 }}>
                            {opMessage.body}
                        </Text>
                    ) : null}
                </View>
            )}

            {user && opMessage && (
                <ReplyComposer
                    placeholder="Reply..."
                    value={topReplyBody}
                    onChangeText={setTopReplyBody}
                    onCancel={() => setTopReplyBody("")}
                    onSubmit={() => submitReply(opMessage.id, topReplyBody, () => setTopReplyBody(""))}
                    submitting={posting}
                />
            )}

            <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.grey4, marginTop: 16, marginBottom: 8 }} />

            <FlatList
                data={rows}
                keyExtractor={({ node }) => node.id}
                refreshing={loading}
                onRefresh={loadTree}
                ListEmptyComponent={!loading ? <Text>No replies yet. Start the conversation by creating one!</Text> : null}
                renderItem={({ item }) => {
                    const hasReplies = item.node.replies.length > 0;
                    const isCollapsed = collapsed.has(item.node.id);
                    const isReplyOpen = activeReplyTarget === item.node.id;

                    return (
                        <View
                            style={{
                                marginLeft: item.depth * 16,
                                marginBottom: 12,
                                paddingLeft: item.depth > 0 ? 12 : 0,
                                borderLeftWidth: item.depth > 0 ? 1 : 0,
                                borderLeftColor: theme.colors.grey4,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                {hasReplies && (
                                    <Pressable onPress={() => toggleCollapse(item.node.id)} hitSlop={8}>
                                        <Text style={{ color: theme.colors.grey3, fontSize: 12, fontWeight: "700" }}>
                                            {isCollapsed ? "[+]" : "[–]"}
                                        </Text>
                                    </Pressable>
                                )}
                                <Text style={{ color: theme.colors.grey3, fontSize: 12 }}>
                                    {authorName(item.node)} · {timeAgo(item.node.created_at)}
                                </Text>
                            </View>

                            {isCollapsed ? (
                                <Pressable onPress={() => toggleCollapse(item.node.id)}>
                                    <Text style={{ color: theme.colors.grey3, fontSize: 12, fontStyle: "italic" }}>
                                        {countDescendants(item.node)} more repl{countDescendants(item.node) === 1 ? "y" : "ies"} hidden
                                    </Text>
                                </Pressable>
                            ) : (
                                <>
                                    <Text style={{ color: theme.colors.text }}>{item.node.body}</Text>

                                    {user && (
                                        <View style={{ alignSelf: "flex-start", marginTop: 4 }}>
                                            <PillButton
                                                title="Reply"
                                                icon={{ name: "chat-bubble-outline", size: 14 }}
                                                onPress={() => {
                                                    if (isReplyOpen) {
                                                        setActiveReplyTarget(null);
                                                        setActiveReplyBody("");
                                                    } else {
                                                        setActiveReplyTarget(item.node.id);
                                                        setActiveReplyBody("");
                                                    }
                                                }}
                                            />
                                        </View>
                                    )}

                                    {isReplyOpen && (
                                        <ReplyComposer
                                            placeholder={`Reply to ${authorName(item.node)}`}
                                            value={activeReplyBody}
                                            onChangeText={setActiveReplyBody}
                                            onCancel={() => {
                                                setActiveReplyTarget(null);
                                                setActiveReplyBody("");
                                            }}
                                            onSubmit={() => submitReply(item.node.id, activeReplyBody, () => {
                                                setActiveReplyBody("");
                                                setActiveReplyTarget(null);
                                            })}
                                            submitting={posting}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    );
                }}
            />

            {error ? <ErrorText>{error}</ErrorText> : null}
        </View>
    );
};

export default ThreadDetail;
