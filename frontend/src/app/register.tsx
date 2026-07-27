import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/services/authContext";

import { Input, Button } from "@rneui/themed";
import { CenteredView, Card } from "@/components/Views";
import { CardHeading, ErrorText, HyperlinkText } from "@/components/Text";
import { DropdownComponent } from "@/components/Dropdown";

const router = useRouter();

const Register = () => {
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    if (user) {
      router.navigate("/home");
    }
  }, [user]);

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
      const response = await fetch("https://backend-995991413043.us-west1.run.app:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        setError("Registration failed. Check your input.");
        return;
      }

      const user = await response.json();
      setUser(user);
      console.log(user);
      router.navigate("/home");

      

    } catch (err) {
      console.error("Registration failed", err);
      setError("Registration failed. Failed to fetch from server.");
    }
  }

  return (
    <CenteredView>
      <Card width={0.9}>
        <CardHeading>Welcome to Happiness!</CardHeading>

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

        <DropdownComponent 
          data={[{ label: "Seeker", value: "seeker" },
                { label: "Provider", value: "provider" }]} 
          value={role}
          onChangeValue={setRole}>
        </DropdownComponent>

        <Button title="Register" onPress={handleRegister} />

        <HyperlinkText onPress={() => router.navigate("/login")}>
          Already have an account? Sign in
        </HyperlinkText>

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Register;