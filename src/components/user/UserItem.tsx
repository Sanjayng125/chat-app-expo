import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { User } from "@/types";
import { getAvatarByName } from "@/utils";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserItemProps {
  user: User;
  isLoading?: boolean;
  onPress?: () => void;
}

const UserItem = ({ user, isLoading, onPress }: UserItemProps) => {
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.userItem, isLoading && { opacity: 0.6 }]}
      activeOpacity={0.6}
      onPress={() => onPress && onPress()}
      disabled={isLoading}
    >
      <View style={styles.userAvatarContainer}>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={colors.text}
            style={styles.conversationLoader}
          />
        )}
        <Image
          source={{
            uri: user.avatar_url || getAvatarByName(user.full_name ?? "User"),
          }}
          style={styles.userAvatar}
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.full_name ?? "User"}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user.email}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    userItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 10,
    },
    userAvatarContainer: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    },
    conversationLoader: {
      position: "absolute",
      zIndex: 10,
      width: "100%",
      height: "100%",
      backgroundColor: colors.background,
      opacity: 0.6,
    },
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    userInfo: {
      flex: 1,
      justifyContent: "center",
      gap: 2,
    },
    userName: {
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.bold,
    },
    userEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
  });

export default UserItem;
