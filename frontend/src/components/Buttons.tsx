import { Button, IconProps } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { useState } from "react";

export const OptionButton = ({ title, onPress, icon }: { title: string, onPress: () => void, icon?: Partial<IconProps> }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(false);

    return (
        <Button
            title={title}
            onPress={onPress}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            icon={{
                name: "fiber-manual-record",
                type: "material",
                size: 20,
                color: theme.colors?.text,
                ...icon,
            }}
            iconContainerStyle={{ marginLeft: 4, marginRight: 12 }}
            buttonStyle={{
                backgroundColor: hovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
                borderRadius: 6,
                paddingVertical: 12,
                justifyContent: "flex-start",
            }}
            titleStyle={{ color: theme.colors?.text, fontWeight: "600", fontSize: 16, textAlign: "left" }}
        />
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