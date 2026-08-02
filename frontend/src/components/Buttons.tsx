import { Button } from "@rneui/themed";
import { useTheme } from "@rneui/themed";

export const OptionButton = ({ title, onPress }: { title: string, onPress: () => void }) => {
    const { theme } = useTheme();

    return (
        <Button
            title={title}
            onPress={onPress}
            buttonStyle={{ backgroundColor: "transparent", paddingVertical: 12 }}
            titleStyle={{ color: theme.colors?.text, fontWeight: "600", fontSize: 16 }}
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