import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/services/authContext";

import { Input, Button } from "@rneui/themed";
import { CenteredView, Card } from "@/components/Views";
import { CardHeading, ErrorText, HyperlinkText } from "@/components/Text";

const router = useRouter();

const Login = () => {
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      router.navigate("/home");
    }
  }, [user]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("https://backend-995991413043.us-west1.run.app:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Login failed", response.statusText);
        setError("Login failed. Check your email and password.");
        return;
      }

      const user = await response.json();
      setUser(user);
      console.log(user);
      router.navigate("/home");


    } catch (err) {
      console.error("Login failed", err);
      setError("Login failed. Failed to fetch from server.");
    }
  }

  return (
    <CenteredView>
      <Card width={0.9}>
        <CardHeading>Welcome back!</CardHeading>

        <Input
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Login" onPress={handleLogin} />

        <HyperlinkText onPress={() => router.navigate("/register")}>
          Don't have an account? Register
        </HyperlinkText>

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Login;