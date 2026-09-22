import AvatarUpdater from "@/components/profile/AvatarUpdater";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { deleteAccount, signOut, updateUser } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { colors, theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState(user?.full_name ?? "");

  const styles = useMemo(() => getStyles(colors), [colors]);

  const { mutate: signOutMutation, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onError: (error: Error | AuthError) => {
      Toast.show({
        type: "error",
        text1: "Sign-Out Error",
        text2: error.message,
      });
    },
  });

  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async () => {
        const updatedUser = await updateUser({
          user_id: user?.id ?? "",
          full_name: fullName.trim(),
        });

        return updatedUser;
      },
      onSuccess: (updatedUser) => {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile has been updated successfully",
        });
        setUser(updatedUser);
      },
      onError: (error: Error | PostgrestError) => {
        Toast.show({
          type: "error",
          text1: "Profile Update Error",
          text2: error.message,
        });
      },
    });

  const { mutate: deleteAccountMutation, isPending: isDeletingAccount } =
    useMutation({
      mutationFn: async () => {
        const avatar_url = user?.avatar_url ?? undefined;

        const deleted = await deleteAccount(avatar_url);

        return deleted;
      },
      onSuccess: () => {
        signOut();
        Toast.show({
          type: "success",
          text1: "Account Deleted",
          text2: "Your account has been deleted successfully",
        });
      },
      onError: (error: Error | PostgrestError) => {
        const isAvatarError = error.message.toLowerCase().includes("avatar");

        Toast.show({
          type: "error",
          text1: isAvatarError
            ? "Avatar Deletion Error"
            : "Account Deletion Error",
          text2: isAvatarError
            ? "Something went wrong while deleting your avatar. Please try again later."
            : "Your avatar was deleted, but your account could not be deleted. Please try again later. you can re-upload your avatar.",
        });
      },
    });

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;

    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteAccountMutation(),
        },
      ],
    );
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim() || fullName.trim() === user?.full_name) return;

    updateProfileMutation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-sharp" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Profile</Text>
          </View>

          <View style={styles.content}>
            <AvatarUpdater />

            <View style={styles.infoContainer}>
              <TextField
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <Text style={styles.infoText}>{user?.email ?? ""}</Text>
              <Text style={styles.infoText}>
                Joined On {new Date(user?.created_at ?? "").toDateString()}
              </Text>
            </View>

            <Button
              text="Update Profile"
              onPress={handleUpdateProfile}
              loading={isUpdatingProfile}
              disabled={
                isSigningOut ||
                isUpdatingProfile ||
                !fullName.trim() ||
                fullName.trim() === user?.full_name
              }
              style={{ marginTop: 10 }}
            />

            <View style={styles.themeToggle}>
              <Ionicons
                name={theme === "dark" ? "sunny-outline" : "moon-outline"}
                size={22}
                color={colors.text}
              />
              <View style={styles.themeToggleLabel}>
                <Text style={styles.themeToggleTitle}>Appearance</Text>
                <Text style={styles.themeToggleDescription}>
                  {theme === "dark" ? "Dark theme" : "Light theme"}
                </Text>
              </View>
              <Switch
                value={theme === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            <Button
              text="Sign Out"
              onPress={() => signOutMutation()}
              style={{ backgroundColor: colors.error, marginTop: 10 }}
              loading={isSigningOut}
              disabled={isSigningOut || isUpdatingProfile || isDeletingAccount}
            />

            <View style={styles.dangerZone}>
              <View style={styles.separator} />

              <Text style={styles.dangerZoneText}>Danger Zone</Text>

              <Button
                text="Delete Account"
                onPress={handleDeleteAccount}
                style={{
                  backgroundColor: colors.error,
                  marginTop: 10,
                  marginRight: "auto",
                }}
                loading={isDeletingAccount}
                disabled={
                  isSigningOut || isUpdatingProfile || isDeletingAccount
                }
                small
              />
            </View>
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
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      paddingHorizontal: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: Fonts.extraBold,
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    infoContainer: {
      marginTop: 80,
      gap: 8,
    },
    infoText: {
      fontSize: 16,
      fontFamily: Fonts.bold,
      color: colors.text,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    themeToggle: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    themeToggleLabel: {
      flex: 1,
      gap: 2,
    },
    themeToggleTitle: {
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.bold,
    },
    themeToggleDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
    dangerZone: {
      marginTop: 40,
      gap: 8,
    },
    separator: {
      height: 1,
      width: "100%",
      backgroundColor: colors.border,
    },
    dangerZoneText: {
      fontSize: 18,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
  });

export default Profile;
