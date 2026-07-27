import React from "react";
import { View } from "react-native";
import { useWindowDimensions } from "react-native";
import { useTheme } from "@rneui/themed";

export const Card = ({ children, width }: { children: React.ReactNode, width: number }) => {
    const { theme } = useTheme()
    const windowWidth = useWindowDimensions().width;

    return (
        <View style={{
            width: windowWidth * width,
            maxWidth: 600,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.colors?.grey5,
            borderRadius: 8,
            gap: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 8,
        }}>
            {children}
        </View>
    );
};

export const CenteredView = ({ children }: { children: React.ReactNode }) => {
    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
        }}>
            {children}
        </View>
    )
};