import { useEffect, useState, useLayoutEffect } from "react";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/services/authContext";

import { Input, Button } from "@rneui/themed";
import { CenteredView, Card } from "@/components/Views";
import { Heading, ErrorText, HyperlinkText } from "@/components/Text";
import { TextDropdown } from "@/components/Dropdown";

const Register = () => {
  const navigation = useNavigation()
  const { user, token, setAuth } = useAuth();
  
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Register",
    });
  }, [navigation]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!email || !password || !confirmPassword || !role) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role !== "seeker" && role !== "provider") {
      setError("Please select a valid role.");
      return;
    }

    try {
      const response = await fetch("https://backend-995991413043.us-west1.run.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Registration failed:", response.status, errorData);
        setError("Registration failed. Check your input.");
        return;
      }

      const { user, token } = await response.json();
      setAuth(user, token);
      console.log(user);
      router.replace("/home");

      

    } catch (err) {
      console.error("Registration failed", err);
      setError("Registration failed. Failed to fetch from server.");
    }
  }

  return (
    <CenteredView>
      <Card width={0.9}>
        <Heading>Welcome to Happiness!</Heading>

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

        <Input
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TextDropdown 
          data={[{ label: "Seeker", value: "seeker" },
                { label: "Provider", value: "provider" }]} 
          value={role}
          onChangeValue={setRole}>
        </TextDropdown>

        <Button title="Register" onPress={handleRegister} />

        <HyperlinkText onPress={() => router.replace("/login")}>
          Already have an account? Sign in
        </HyperlinkText>

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Register;