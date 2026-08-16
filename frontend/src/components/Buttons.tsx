import { Button, IconProps } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { useState, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons";

// Renders the icon ourselves instead of via RNEUI's Button `icon` prop: that prop routes
// through RNEUI's Icon component, which always sets accessibilityRole="button" on its
// wrapper even without an onPress — react-native-web turns that into a literal <button>,
// nested inside this Button's own <button>, which React DOM flags as invalid.
export const OptionButton = ({ title, onPress, icon }: { title: string, onPress: () => void, icon?: Partial<IconProps> }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(false);

    return (
        <Button
            onPress={onPress}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            buttonStyle={{
                backgroundColor: hovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
                borderRadius: 6,
                paddingVertical: 12,
                justifyContent: "flex-start",
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <MaterialIcons
                    name={(icon?.name ?? "fiber-manual-record") as ComponentProps<typeof MaterialIcons>["name"]}
                    size={icon?.size ?? 20}
                    color={(icon?.color as string) ?? theme.colors?.text}
                />
                <Text style={{ color: theme.colors?.text, fontWeight: "600", fontSize: 16, textAlign: "left" }}>
                    {title}
                </Text>
            </View>
        </Button>
    );
}

// A compact, borderless pill that only shows a background on hover — used for
// secondary/inline actions (reply triggers, cancel/submit on inline composers).
export const PillButton = ({ title, onPress, icon, disabled }: { title: string, onPress: () => void, icon?: Partial<IconProps>, disabled?: boolean }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            disabled={disabled}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: hovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 18,
                opacity: disabled ? 0.5 : 1,
            }}
        >
            {icon && (
                <MaterialIcons
                    name={(icon.name ?? "circle") as ComponentProps<typeof MaterialIcons>["name"]}
                    size={icon.size ?? 14}
                    color={(icon.color as string) ?? theme.colors?.grey3}
                />
            )}
            <Text style={{ color: theme.colors?.grey3, fontWeight: "700" }}>{title}</Text>
        </Pressable>
    );
}

export const SelectionButton = ({ title, onPress }: { title: string, onPress: () => void }) => {
    const { theme } = useTheme();
    
    return (
        <Button
            title={title}
            onPress={onPress}
            buttonStyle={{ backgroundColor: theme.colors?.secondary, borderRadius: 8, paddingVertical: 12 }}
            titleStyle={{ color: theme.colors?.text, fontWeight: "600", fontSize: 16 }}
        />
    );
}