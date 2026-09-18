import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { signUp } from "@/services/auth";
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

const SignUp = () => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const styles = useMemo(() => getStyles(colors), [colors]);

  const { mutate: signUpMutation, isPending: isSignUpPending } = useMutation({
    mutationFn: async () => {
      const { session, user } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
      );

      return { session, user };
    },
    onSuccess: () => {
      router.replace("/(app)");
    },
    onError: (error: AuthError) => {
      if (error.code === "email_address_invalid") {
        Alert.alert("Invalid Email", "Please check your email");
        return;
      }

      if (error.code === "email_exists") {
        Alert.alert("Email Already Exists", "Please check your email");
        return;
      }

      if (error.code === "weak_password") {
        Alert.alert("Weak Password", "Please check your password");
        return;
      }

      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }
    signUpMutation();
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

          <Text style={styles.title}>Create new account</Text>

          <View>
            <TextField
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
            />
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
            text="Sign-Up"
            loading={isSignUpPending}
          />

          <View style={styles.footer}>
            <Text style={styles.subtitle}>Already have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.signInBtn}
              onPress={() => router.push("/(auth)/sign-in")}
            >
              <Text style={styles.signInBtnText}>Sign-In</Text>
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
    signInBtn: {
      justifyContent: "center",
      alignItems: "center",
    },
    signInBtnText: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: Fonts.bold,
      textAlign: "center",
    },
  });

export default SignUp;
