import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { Conversation } from "@/types";
import { formatTime, getAvatarByName } from "@/utils";
import { router } from "expo-router";
import { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.conversation}
      activeOpacity={0.6}
      onPress={() => router.push(`/(app)/conversation/${conversation.id}`)}
    >
      <Image
        source={{
          uri:
            conversation.other_users?.[0]?.avatar_url ||
            getAvatarByName(conversation.other_users?.[0]?.full_name ?? "User"),
        }}
        style={styles.conversationAvatar}
      />
      <View style={styles.conversationContent}>
        <Text style={styles.conversationName}>
          {conversation.other_users?.[0]?.full_name ?? "User"}
        </Text>
        <View style={styles.conversationLastMessageContainer}>
          <Text style={styles.conversationLastMessage} numberOfLines={1}>
            {conversation.last_message?.content ??
              `Say hi to ${conversation.other_users?.[0]?.full_name ?? "User"}`}
          </Text>
          {conversation.last_message?.created_at && (
            <Text style={styles.conversationLastMessageTime}>
              {formatTime(conversation.last_message?.created_at)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    conversation: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 10,
    },
    conversationContent: {
      flex: 1,
      justifyContent: "center",
      gap: 2,
    },
    conversationAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    conversationName: {
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.bold,
    },
    conversationLastMessageContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
    },
    conversationLastMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
    conversationLastMessageTime: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
    },
  });

export default ConversationItem;
