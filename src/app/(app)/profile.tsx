import Button from "@/components/ui/Button";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { signOut, updateAvatar, updateUser } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { getAvatarByName } from "@/utils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { colors, theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [image, setImage] = useState<string | null>(null);

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
        console.log("Updated User: ", updatedUser);
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

  const { mutate: updateAvatarMutation, isPending: isAvatarUpdating } =
    useMutation({
      mutationFn: async ({
        image,
        mimeType,
      }: {
        image: string;
        mimeType: string;
      }) => {
        const oldFileURL = user?.avatar_url ? user.avatar_url : undefined;
        const updatedUser = await updateAvatar(
          user?.id!,
          image,
          mimeType,
          oldFileURL,
        );

        return updatedUser;
      },
      onSuccess: (updatedUser) => {
        Toast.show({
          type: "success",
          text1: "Avatar Updated",
          text2: "Your avatar has been updated successfully",
        });
        setUser(updatedUser);
      },
      onError: (error: Error | PostgrestError) => {
        Toast.show({
          type: "error",
          text1: "Avatar Update Error",
          text2: error.message,
        });
      },
      onSettled: () => {
        setImage(null);
      },
    });

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required to update your avatar.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      updateAvatarMutation({
        image: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || "image/jpeg",
      });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the camera is required to update your avatar.",
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      updateAvatarMutation({
        image: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || "image/jpeg",
      });
    }
  };

  const handleAvatarUpdate = () => {
    Alert.alert("Update Avatar", "Choose an option", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Pick Image",
        style: "default",
        onPress: () => void pickImage(),
      },
      {
        text: "Take Photo",
        style: "default",
        onPress: () => void takePhoto(),
      },
    ]);
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
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.avatarContainer}
              onPress={handleAvatarUpdate}
              disabled={isAvatarUpdating}
            >
              <Image
                source={{
                  uri:
                    image ||
                    (user?.avatar_url && `${user.avatar_url}v=${Date.now()}`) ||
                    getAvatarByName(user?.full_name ?? "User"),
                }}
                style={styles.avatar}
              />
              <MaterialIcons
                name="edit"
                size={24}
                style={styles.avatarEditIcon}
              />
              {isAvatarUpdating && (
                <ActivityIndicator
                  size="large"
                  color={colors.text}
                  style={styles.avatarLoader}
                />
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <TextInput
                style={styles.infoInput}
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
              loading={isSigningOut || isUpdatingProfile}
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
              disabled={isSigningOut}
            />
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
    avatarContainer: {
      width: 200,
      height: 200,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      alignSelf: "center",
      position: "relative",
      overflow: "hidden",
    },
    avatar: {
      width: 200,
      height: 200,
      borderRadius: 100,
    },
    avatarEditIcon: {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
      color: colors.background,
      padding: 10,
      borderRadius: 100,
    },
    avatarLoader: {
      position: "absolute",
      zIndex: 10,
      width: "100%",
      height: "100%",
      backgroundColor: colors.background,
      opacity: 0.6,
    },
    infoContainer: {
      marginTop: 80,
      gap: 8,
    },
    infoInput: {
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.bold,
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoText: {
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
      fontFamily: Fonts.bold,
      paddingHorizontal: 16,
      paddingVertical: 12,
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
  });

export default Profile;
