import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { SignInSchema, SignInSchemaType } from "@/lib/schemas";
import { signIn } from "@/services/auth";
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

const SignIn = () => {
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: signInMutation, isPending: isSignInPending } = useMutation({
    mutationFn: async ({ email, password }: SignInSchemaType) => {
      const { session, user } = await signIn(email, password);

      return { session, user };
    },
    onSuccess: () => {
      router.replace("/(app)");
    },
    onError: (error: AuthError) => {
      if (error.code === "invalid_credentials") {
        Toast.show({
          type: "error",
          text1: "Invalid Credentials",
          text2: "Please check your credentials",
        });
        return error;
      }

      if (error.code === "user_banned") {
        Toast.show({
          type: "error",
          text1: "User Banned",
          text2: "Please check your email",
        });
        return error;
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
      return error;
    },
  });

  const onSubmit: SubmitHandler<SignInSchemaType> = async (data) =>
    signInMutation(data);

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
          {router.canGoBack() && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-sharp" size={28} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={styles.logoContainer}>
            <Image
              source={require("@assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>Sign-In to your account</Text>

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
                  style={{ marginTop: 20 }}
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
                  style={{ marginTop: 20 }}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            text="Sign-In"
            loading={isSignInPending}
            disabled={isSignInPending}
            style={{ marginTop: 20 }}
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
