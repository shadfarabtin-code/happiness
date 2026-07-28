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

  const [step, setStep] = useState(1);

  //Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //Step 2
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  // Step 3 (only if role === "provider")
  const [companyName, setCompanyName] = useState("");

  const [error, setError] = useState("");
  const isLastStep = step === 3 || (step === 2 && role !== "provider");

  function handleNext() {
    if (step === 1) {
      if (!email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (role !== "seeker" && role !== "provider") {
        setError("Please select a valid role.");
        return;
      }
      if (role === "provider") {
        setStep(3);
      } else {
        handleRegister(); // seekers skip step 3 entirely
      }
    } else if (step === 3) {
      handleRegister();
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleRegister() {
    try {
      const response = await fetch("https://backend-995991413043.us-west1.run.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          password: password, 
          first_name: firstName, 
          last_name: lastName, 
          role: role, 
          company_name: role === "provider" ? companyName : null, 
        }),
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
        {step === 1 && (
          <>
            <Heading>Welcome to Happiness!</Heading>
            <Input placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <Input placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </>
        )}  

        {step === 2 && (
          <>
          <Input placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <Input placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <TextDropdown 
            data={[{ label: "Seeker", value: "seeker" },
                  { label: "Provider", value: "provider" }]} 
            value={role}
            onChangeValue={setRole}>
          </TextDropdown>
          </>
        )}

        {step === 3 && (
          <Input placeholder="Company Name" value={companyName} onChangeText={setCompanyName} />
        )}
        
        <Button title={isLastStep ? "Register" : "Next"} onPress={handleNext} />
        {step > 1 && <Button title="Back" type="outline" onPress={handleBack} />}

        {step === 1 && <HyperlinkText onPress={() => router.replace("/login")}>
          Already have an account? Sign in
        </HyperlinkText>}

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Register;