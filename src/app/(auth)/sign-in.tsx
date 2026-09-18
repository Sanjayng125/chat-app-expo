import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { signIn } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const styles = useMemo(() => getStyles(colors), [colors]);

  const { mutate: signInMutation, isPending: isSignInPending } = useMutation({
    mutationFn: async () => {
      const { session, user } = await signIn(formData.email, formData.password);

      return { session, user };
    },
    onSuccess: () => {
      router.replace("/(app)");
    },
    onError: (error: AuthError) => {
      if (error.code === "invalid_credentials") {
        Alert.alert("Invalid Credentials", "Please check your credentials");
        return;
      }

      if (error.code === "user_banned") {
        Alert.alert("User Banned", "Please check your email");
        return;
      }

      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }
    signInMutation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-sharp" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require("@assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>Sign-In to your account</Text>

          <View>
            <TextField
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextField
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
            />
          </View>

          <Button
            onPress={() => handleSubmit()}
            text="Sign-In"
            loading={isSignInPending}
          />

          <View style={styles.footer}>
            <Text style={styles.subtitle}>Don't have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.signUpBtn}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              <Text style={styles.signUpBtnText}>Sign-Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    content: {
      flexGrow: 1,
      paddingBottom: 34,
    },
    backBtn: {
      marginTop: 20,
      paddingHorizontal: 4,
    },
    logo: {
      width: 250,
      height: 250,
    },
    logoContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 60,
    },
    title: {
      fontSize: 24,
      fontFamily: Fonts.extraBold,
      marginTop: 20,
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
    footer: {
      marginTop: 40,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    signUpBtn: {
      justifyContent: "center",
      alignItems: "center",
    },
    signUpBtnText: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: Fonts.bold,
      textAlign: "center",
    },
  });

export default SignIn;
