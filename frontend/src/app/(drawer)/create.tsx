import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme } from "@rneui/themed";

import { useAuth } from "@/services/authContext";
import { createThread, postMessage } from "@/services/api";
import { ErrorText } from "@/components/Text";

const Create = () => {
    const { theme } = useTheme();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [body, setBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");

    async function handlePost() {
        if (!token) return;
        if (!title.trim()) {
            setError("Give the thread a title.");
            return;
        }
        setPosting(true);
        try {
            setError("");
            const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
            const thread = await createThread(token, title.trim(), tagList);
            // Always post a root message so this thread has an OP post that replies can nest under
            await postMessage(token, thread.id, body.trim(), null);
            router.replace(`/threads/${thread.id}`);
        } catch (err) {
            console.error("Failed to create thread", err);
            setError("Couldn't create the thread.");
        } finally {
            setPosting(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24 }}>
            <View>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    style={{ color: theme.colors.text, fontSize: 32, fontWeight: "700", paddingVertical: 4 }}
                />
                {!title && (
                    <View style={{ position: "absolute", top: 4, left: 0, flexDirection: "row" }} pointerEvents="none">
                        <Text style={{ color: theme.colors.grey2, fontSize: 32, fontWeight: "700" }}>Title</Text>
                        <Text style={{ color: "#fa5252", fontSize: 32, fontWeight: "700" }}>*</Text>
                    </View>
                )}
            </View>

            <View style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                borderWidth: 1,
                borderColor: theme.colors.grey4,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginTop: 20,
                gap: 8,
            }}>
                <Icon name="local-offer" type="material" size={16} color={theme.colors.grey3} />
                <TextInput
                    placeholder="Add tags"
                    placeholderTextColor={theme.colors.grey3}
                    value={tags}
                    onChangeText={setTags}
                    style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", minWidth: 70 }}
                />
            </View>

            <TextInput
                placeholder="Body text (optional)"
                placeholderTextColor={theme.colors.grey3}
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                style={{ color: theme.colors.text, fontSize: 18, marginTop: 24, flex: 1 }}
            />

            {error ? <ErrorText>{error}</ErrorText> : null}

            <View style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
                paddingTop: 16,
                marginTop: 8,
                borderTopWidth: 1,
                borderTopColor: theme.colors.grey4,
            }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ backgroundColor: theme.colors.primary, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 }}
                >
                    <Text style={{ color: theme.colors.grey3, fontWeight: "700" }}>Save Draft</Text>
                </Pressable>
                <Pressable
                    onPress={handlePost}
                    disabled={posting || !title.trim()}
                    style={{
                        backgroundColor: theme.colors.primary,
                        borderRadius: 999,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        opacity: !title.trim() ? 0.5 : 1,
                    }}
                >
                    <Text style={{ color: theme.colors.grey3, fontWeight: "700" }}>{posting ? "Posting..." : "Post"}</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Create;
