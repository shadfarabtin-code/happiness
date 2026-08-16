import React from "react";
import { View, Text } from "react-native";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

// In dev, let errors surface normally (Metro's overlay is useful while building).
// In production, swallow the crash and show a plain fallback instead of a blank
// screen or a raw stack trace.
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error("Unhandled error", error);
    }

    render() {
        if (this.state.hasError && !__DEV__) {
            return (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <Text style={{ fontSize: 16, textAlign: "center" }}>
                        Something went wrong. Please refresh the page.
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}
