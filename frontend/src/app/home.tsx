import { CenteredView } from "@/components/Views";
import { View } from "react-native"
import { Button, Avatar, Overlay, ListItem } from "@rneui/themed";

import { useLayoutEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/services/authContext";

const UserSettings = () => {
    const [ active, isActive ] = useState(false);
    const { user, setAuth } = useAuth();

    async function handleLogout() {
        setAuth(null, null);
        router.replace("/login");
    }

    return (
        <>
            <Avatar avatarStyle={{marginRight: 10}}
                rounded
                size="medium"
                icon={{ name: "person", type: "material" }}
                onPress={() => user ? isActive(true) : router.replace("/login")}
            />
            <Overlay
                isVisible={active}
                onBackdropPress={() => isActive(false)}
                backdropStyle={{ backgroundColor: "transparent" }}
                overlayStyle={{
                    position: "absolute",
                    top: 65,
                    right: 15,
                    margin: 0,
                    width: 250,
                }}
            >
                <View style={{flexDirection:"row"}}>
                    <Avatar avatarStyle={{justifyContent:"flex-start"}}
                        rounded
                        size="medium"
                        icon={{ name: "person", type: "material" }}
                        onPress={() => isActive(true)}
                    />
                    <ListItem>
                        <ListItem.Content>
                            <ListItem.Title>{user?.first_name + " " + user?.last_name}</ListItem.Title>
                            <ListItem.Subtitle>{user?.company_name}</ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem>
                </View>
                <Button onPress={() => handleLogout()}>Log Out</Button>
            </Overlay>
        </>
    );
};

const Home = () => {
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Home",
            headerRight: () => <UserSettings/>
        });
    }, [navigation]);

    return (
        <CenteredView>
            <></>
        </CenteredView>
    );
};

export default Home;