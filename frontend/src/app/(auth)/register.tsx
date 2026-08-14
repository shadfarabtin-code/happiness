import { useEffect, useState, useLayoutEffect } from "react";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/services/authContext";

import { Input } from "@rneui/themed";
import { SelectionButton } from "@/components/Buttons";
import { CenteredView, Card } from "@/components/Views";
import { Heading, ErrorText, HyperlinkText } from "@/components/Text";
import { TextDropdown } from "@/components/Dropdown";
import { register } from "@/services/api";

const Register = () => {
  const navigation = useNavigation()
  const { user, setAuth } = useAuth();
  
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
      if (password.length > 32) {
        setError("Password must be 32 characters or fewer.");
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
      const { token, user } = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        company_name: role === "provider" ? companyName : null,
      });
      setAuth(user, token);
      router.replace("/home");
    } catch (err) {
      console.error("Registration failed", err);
      // A TypeError means fetch itself couldn't reach the server; anything else is a response the backend sent back.
      if (err instanceof TypeError) {
        setError("Registration failed. Failed to fetch from server.");
      } else {
        setError("Registration failed. Check your input.");
      }
    }
  }

  return (
    <CenteredView>
      <Card width={0.9}>
        {step === 1 && (
          <>
            <Heading>Welcome to Happiness!</Heading>
            <Input placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <Input placeholder="Password" secureTextEntry maxLength={32} value={password} onChangeText={setPassword} />
            <Input placeholder="Confirm Password" secureTextEntry maxLength={32} value={confirmPassword} onChangeText={setConfirmPassword} />
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
        
        <SelectionButton title={isLastStep ? "Register" : "Next"} onPress={handleNext} />
        {step > 1 && <SelectionButton title="Back" onPress={handleBack} />}

        {step === 1 && <HyperlinkText onPress={() => router.replace("/login")}>
          Already have an account? Sign in
        </HyperlinkText>}

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Card>
    </CenteredView>
  );
};

export default Register;