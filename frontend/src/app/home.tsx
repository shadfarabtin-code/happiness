import { CenteredView, Card } from "@/components/Views";
import { CardHeading } from "@/components/Text";
import { Text } from "@rneui/base";

import { useAuth } from "@/services/authContext";

const Home = () => {
    const { user } = useAuth();

    return (
        <CenteredView>
            <Card width={0.5}>
                <CardHeading>User Info</CardHeading>
                <Text>{user?.email}</Text>
            </Card>
        </CenteredView>
    );
};

export default Home;