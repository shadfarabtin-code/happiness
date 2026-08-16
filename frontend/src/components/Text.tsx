import React from "react";
import { Text, Pressable, View } from "react-native";
import { useTheme } from "@rneui/themed";
import MaterialIcons from "@react-native-vector-icons/material-icons";

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

export const Tag = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useTheme()

    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            borderWidth: 1,
            borderColor: theme.colors?.grey4,
            borderRadius: 999,
            paddingVertical: 4,
            paddingHorizontal: 10,
        }}>
            <MaterialIcons name="local-offer" size={12} color={theme.colors?.grey3} />
            <Text style={{ color: theme.colors?.grey3, fontSize: 12 }}>{children}</Text>
        </View>
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
