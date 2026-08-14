import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/services/authContext";

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    if (user === undefined) return; // still loading
    router.replace(user ? "/home" : "/login");
  }, [user]);

  return null;
}
