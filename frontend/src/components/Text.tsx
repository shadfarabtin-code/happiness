import React from "react";
import { Text, Pressable } from "react-native";
import { useTheme } from "@rneui/themed";

export const Heading = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useTheme()
    
    return (
        <Text style={{
            color: theme.colors?.text,
            fontSize: 40,
            fontWeight: "bold",
            alignSelf: "flex-start",
            marginBottom: 16,
        }}>
            {children}
        </Text>
    )
};

export const ErrorText = ({ children }: { children: React.ReactNode }) => {
    return (
        <Text style={{
            color: "red",
        }}>
            {children}
        </Text>
    )
};

export const HyperlinkText = ({ children, onPress }: { children: React.ReactNode, onPress: () => void }) => {
    const { theme } = useTheme()

    return (
        <Pressable>
            {({ hovered }) => (
                <Text style={{
                    color: theme.colors?.link,
                    textDecorationLine: hovered ? "underline" : "none",
                }}
                    onPress={onPress}
                >
                    {children}
                </Text>
            )}
        </Pressable>
    )
}
