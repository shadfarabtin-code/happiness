import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/services/authContext";

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    router.replace("/home");
  });

  return null;
}
