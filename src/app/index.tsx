import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { useEffect } from "react";

const Index = () => {
  const { session } = useAuthStore();

  useEffect(() => {
    if (session) router.replace("/(app)");
    else router.replace("/(auth)/welcome");
  }, [session]);

  return null;
};

export default Index;
