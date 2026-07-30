import { Input, Button } from "@rneui/themed";
import { CenteredView, Card } from "@/components/Views";
import { Heading, ErrorText, HyperlinkText } from "@/components/Text";

import { useEffect, useState, useLayoutEffect } from "react";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/services/authContext";

const Login = () => {
  const navigation = useNavigation();
  const { user, token, setAuth } = useAuth();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Log In",
    });
  }, [navigation]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("https://backend-995991413043.us-west1.run.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Login failed", response.status, errorData);
        setError("Login failed. Check your email and password.");
        return;
      }

      const { token, user } = await response.json();
      setAuth(user, token);
      console.log(user);
      router.replace("/home");


    } catch (err) {
      console.error("Login failed", err);
      setError("Login failed. Failed to fetch from server.");
    }
  }

  return (
    <CenteredView>
      <Card width={0.9}>
        <Heading>Welcome back!</Heading>

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

        <HyperlinkText onPress={() => router.replace("/register")}>
          Don't have an account? Register
        </HyperlinkText>

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Login;