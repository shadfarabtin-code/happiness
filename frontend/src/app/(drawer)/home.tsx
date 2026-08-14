import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Input, useTheme } from "@rneui/themed";

import { useAuth } from "@/services/authContext";
import { getThreads, createThread, type ThreadOut } from "@/services/api";
import { Heading, ErrorText } from "@/components/Text";
import { OptionButton, SelectionButton } from "@/components/Buttons";

const Home = () => {
    const { theme } = useTheme();
    const { user, token } = useAuth();

    const [threads, setThreads] = useState<ThreadOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [creating, setCreating] = useState(false);

    const loadThreads = useCallback(async () => {
        try {
            setError("");
            setThreads(await getThreads());
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

    async function handleCreateThread() {
        if (!token) return;
        if (!title.trim()) {
            setError("Give the thread a title.");
            return;
        }
        setCreating(true);
        try {
            setError("");
            const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
            const thread = await createThread(token, title.trim(), tagList);
            setTitle("");
            setTags("");
            setThreads((prev) => [thread, ...prev]);
        } catch (err) {
            console.error("Failed to create thread", err);
            setError("Couldn't create the thread.");
        } finally {
            setCreating(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
            <Heading>Threads</Heading>

            {user && (
                <View style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: 8,
                    padding: 16,
                    gap: 8,
                    marginBottom: 16,
                }}>
                    <Input placeholder="Thread title" value={title} onChangeText={setTitle} />
                    <Input placeholder="Tags (comma separated)" value={tags} onChangeText={setTags} />
                    <SelectionButton title={creating ? "Posting..." : "New Thread"} onPress={handleCreateThread} />
                </View>
            )}

            {error ? <ErrorText>{error}</ErrorText> : null}

            <FlatList
                data={threads}
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={loadThreads}
                ListEmptyComponent={!loading ? <ErrorText>No threads yet.</ErrorText> : null}
                renderItem={({ item }) => (
                    <OptionButton
                        title={item.tags.length ? `${item.title}  (${item.tags.join(", ")})` : item.title}
                        onPress={() => router.push(`/threads/${item.id}`)}
                    />
                )}
            />
        </View>
    );
};

export default Home;
