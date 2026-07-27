import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "../services/authContext";

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    if (user === undefined) console.log("Loading user from secure storage...");
    else if (user === null) router.navigate("/login");
    else router.navigate("/home");
  }, [user]);

  return null;
}
