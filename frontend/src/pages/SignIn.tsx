import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Sign in failed. Check your email and password.");
        return;
      }

      const user = await response.json();
      console.log(user);
    } catch (err) {
      console.error("Login failed", err);
      setError("Sign in failed. Failed to fetch from server.");
    }
  }

  return (
    <View style={styles.centerWrapper}>
      <View style={styles.card}>
        <Text style={styles.heading}>Welcome back!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 400,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // shadow equivalent on Android
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 6,
    padding: 12,
    width: "100%",
  },
  button: {
    backgroundColor: "#3182ce",
    borderRadius: 6,
    paddingVertical: 12,
    alignSelf: "center",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: "red",
  },
});

export default SignIn;