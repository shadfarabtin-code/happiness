import { Input } from "@rneui/themed";
import { SelectionButton } from "@/components/Buttons";
import { CenteredView, Card } from "@/components/Views";
import { Heading, ErrorText, HyperlinkText } from "@/components/Text";

import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/services/authContext";
import { login } from "@/services/api";

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
      const { token, user } = await login(email, password);
      setAuth(user, token);
      router.replace("/home");
    } catch (err) {
      console.error("Login failed", err);
      // A TypeError means fetch itself couldn't reach the server; anything else is a response the backend sent back.
      if (err instanceof TypeError) {
        setError("Login failed. Failed to fetch from server.");
      } else {
        setError("Login failed. Check your email and password.");
      }
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