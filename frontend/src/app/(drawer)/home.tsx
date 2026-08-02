import { View } from "react-native"
import { ErrorText } from "@/components/Text"

const Home = () => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ErrorText>Welcome to Happiness!</ErrorText>
        </View>
    );
};

export default Home;