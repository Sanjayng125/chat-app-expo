import { useAuthStore } from "@/stores/authStore";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session) router.replace("/(auth)/sign-in");
  }, [session]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
