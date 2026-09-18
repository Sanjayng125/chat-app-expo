import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { SignUpSchema, SignUpSchemaType } from "@/lib/schemas";
import { signUp } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
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
import Toast from "react-native-toast-message";

const SignUp = () => {
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const { mutate: signUpMutation, isPending: isSignUpPending } = useMutation({
    mutationFn: async ({ email, password, fullName }: SignUpSchemaType) => {
      const { session, user } = await signUp(email, password, fullName);

      return { session, user };
    },
    onSuccess: () => {
      router.replace("/(app)");
    },
    onError: (error: AuthError) => {
      if (error.code === "email_address_invalid") {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please check your email",
        });
        return;
      }

      if (
        error.code === "user_already_exists" ||
        error.code === "email_exists"
      ) {
        Toast.show({
          type: "error",
          text1: "User Already Exists",
          text2: "You can sign in with your email",
        });
        return;
      }

      if (error.code === "weak_password") {
        Toast.show({
          type: "error",
          text1: "Weak Password",
          text2: "Please check your password",
        });
        return;
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    },
  });

  const onSubmit: SubmitHandler<SignUpSchemaType> = async (data) =>
    signUpMutation(data);

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
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextField
                  placeholder="Full Name"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.fullName && (
              <Text style={styles.error}>{errors.fullName.message}</Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextField
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextField
                  placeholder="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            text="Sign-Up"
            loading={isSignUpPending}
            disabled={isSignUpPending}
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
      width: 300,
      height: 300,
    },
    logoContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: Fonts.extraBold,
      marginTop: 10,
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
    error: {
      fontSize: 12,
      color: colors.error,
      fontFamily: Fonts.bold,
      paddingHorizontal: 4,
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
