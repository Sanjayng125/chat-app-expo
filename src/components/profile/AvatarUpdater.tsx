import { ColorScheme } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";
import { updateAvatar } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { getAvatarByName } from "@/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AvatarUpdater() {
  const { user, setUser } = useAuthStore();
  const [image, setImage] = useState<string | null>(null);
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

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
    Alert.alert("Update Avatar", "Image size must be less than 2MB", [
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

  return (
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
            user?.avatar_url ||
            getAvatarByName(user?.full_name ?? "User"),
        }}
        style={styles.avatar}
      />
      <MaterialIcons name="edit" size={24} style={styles.avatarEditIcon} />
      {isAvatarUpdating && (
        <ActivityIndicator
          size="large"
          color={colors.text}
          style={styles.avatarLoader}
        />
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
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
  });
