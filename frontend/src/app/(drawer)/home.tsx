import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@rneui/themed";

import { getThreads, getThreadTree, type ThreadOut } from "@/services/api";
import { timeAgo } from "@/services/threadContext";
import { Heading, ErrorText, Tag } from "@/components/Text";

const ThreadRow = ({ thread, opBody, onPress }: { thread: ThreadOut; opBody?: string; onPress: () => void }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(false);

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
                gap: 6,
            }}
        >
            <Text style={{ color: theme.colors.grey3, fontSize: 12 }}>
                {`${thread.author_first_name} ${thread.author_last_name}`.trim() || thread.author_email} · {timeAgo(thread.created_at)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
                    {thread.title}
                </Text>
                {thread.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            </View>
            {opBody ? (
                <Text style={{ color: theme.colors.grey3, fontSize: 13 }} numberOfLines={2}>
                    {opBody}
                </Text>
            ) : null}
        </Pressable>
    );
};

const Home = () => {
    const { theme } = useTheme();

    const [threads, setThreads] = useState<ThreadOut[]>([]);
    const [opBodies, setOpBodies] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadThreads = useCallback(async () => {
        try {
            setError("");
            // Firestore returns threads in no particular order, so sort newest-first here
            const data = (await getThreads()).sort((a, b) => b.created_at - a.created_at);
            setThreads(data);

            // Each thread's OP post is a message under it, not part of the thread itself
            const bodies = await Promise.all(
                data.map(async (thread) => {
                    try {
                        const tree = await getThreadTree(thread.id);
                        return [thread.id, tree[0]?.body ?? ""] as const;
                    } catch (err) {
                        console.error("Failed to load OP message for thread", thread.id, err);
                        return [thread.id, ""] as const;
                    }
                })
            );
            setOpBodies(Object.fromEntries(bodies));
        } catch (err) {
            console.error("Failed to load threads", err);
            setError("Couldn't load threads.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadThreads();
        }, [loadThreads])
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
            <Heading>Threads</Heading>

            {error ? <ErrorText>{error}</ErrorText> : null}

            <FlatList
                data={threads}
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={loadThreads}
                ListEmptyComponent={!loading ? <ErrorText>No threads yet.</ErrorText> : null}
                renderItem={({ item }) => (
                    <ThreadRow
                        thread={item}
                        opBody={opBodies[item.id]}
                        onPress={() => router.push({
                            pathname: "/threads/[id]",
                            params: { id: item.id, title: item.title, tags: item.tags.join(",") },
                        })}
                    />
                )}
            />
        </View>
    );
};

export default Home;
