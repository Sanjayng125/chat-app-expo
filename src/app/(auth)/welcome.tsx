import Button from "@/components/ui/Button";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeImageContainer}>
        <Image
          source={require("@assets/images/welcome.png")}
          style={styles.welcomeImage}
        />
      </View>

      <Text style={styles.title}>Welcome to Convo</Text>
      <Text style={styles.subtitle}>Chat without the noise.</Text>

      <Button
        onPress={() => router.push("/(auth)/sign-up")}
        text="Get Started"
        style={{ width: "100%", marginTop: 20 }}
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
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    welcomeImage: {
      width: 400,
      height: 400,
    },
    welcomeImageContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 60,
    },
    title: {
      fontSize: 28,
      fontFamily: Fonts.extraBold,
      marginTop: 20,
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      fontSize: 18,
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
      fontSize: 18,
      fontFamily: Fonts.bold,
      textAlign: "center",
    },
  });

export default Welcome;
