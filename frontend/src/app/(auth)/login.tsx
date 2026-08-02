import { Input } from "@rneui/themed";
import { SelectionButton } from "@/components/Buttons";
import { CenteredView, Card } from "@/components/Views";
import { Heading, ErrorText, HyperlinkText } from "@/components/Text";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/services/authContext";

const Login = () => {
  const { user, setAuth } = useAuth();

  useEffect(() => {
    if (user) router.replace("/home");

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

        <SelectionButton title="Login" onPress={handleLogin} />

        <HyperlinkText onPress={() => router.replace("/register")}>
          Don't have an account? Register
        </HyperlinkText>

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Login;