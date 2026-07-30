import { CenteredView } from "@/components/Views";
import { Text, Button, Avatar, Icon } from "@rneui/themed";

import { useLayoutEffect } from "react";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/services/authContext";

const UserSettings = () => {
    return (
        <Avatar avatarStyle={{marginRight: 10}}
            rounded
            size="medium"
            icon={{ name: "person", type: "material" }}
        />
    );
};

const Home = () => {
    const { user, token, setAuth } = useAuth();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Home",
            headerRight: () => <UserSettings/>
        });
    }, [navigation]);

    async function handleLogout() {
        setAuth(null, null);
        router.replace("/login");
    }

    return (
        <CenteredView>
            <Text>"home"</Text>
        </CenteredView>
    );
};

export default Home;