import React from "react";
import { View } from "react-native";
import { useWindowDimensions } from "react-native";
import { useTheme } from "@rneui/themed";

export const Card = ({ children, width }: { children: React.ReactNode, width: number }) => {
    const { theme } = useTheme()
    const windowWidth = useWindowDimensions().width;

    return (
        <View style={{
            backgroundColor: theme.colors?.primary,
            width: windowWidth * width,
            maxWidth: 600,
            padding: 24,
            borderRadius: 8,
            gap: 16,
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
            elevation: 8,
        }}>
            {children}
        </View>
    );
};

export const CenteredView = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useTheme()

    return (
        <View style={{
            backgroundColor: theme.colors?.background,
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
        }}>
            {children}
        </View>
    )
};