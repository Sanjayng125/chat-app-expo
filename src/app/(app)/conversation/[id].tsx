import TextField from "@/components/ui/TextField";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useMessages } from "@/hooks/useMessages";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { sendMessage } from "@/services/messages";
import { useAuthStore } from "@/stores/authStore";
import { Conversation as ConversationType, Message } from "@/types";
import { formatTime, getAvatarByName } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Conversation = () => {
  const { id } = useLocalSearchParams();
  const { session } = useAuthStore();
  const { colors } = useTheme();
  const messagesListRef = useRef<FlatList<Message>>(null);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const conversations = queryClient.getQueryData<ConversationType[]>([
    "conversations",
    session?.user.id,
  ]);
  const conversation = conversations?.find((c) => c.id === id);

  const { messages, isLoading, refetch, isRefetching, error } = useMessages(
    id as string,
  );

  const styles = useMemo(() => getStyles(colors), [colors]);

  const { mutate: sendMessageMutation, isPending: isSendingMessage } =
    useMutation({
      mutationFn: async () => {
        const new_message = await sendMessage({
          conversation_id: id as string,
          sender_id: session?.user.id!,
          content: message,
        });
        return new_message;
      },
      onSuccess: () => {},
      onError: (error: Error | PostgrestError) => {
        queryClient.refetchQueries({ queryKey: ["messages", id] });
        Toast.show({
          type: "error",
          text1: `Error sending message: ${error.name}`,
          text2: error.message,
        });
      },
      onSettled: () => {
        setMessage("");
      },
    });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const new_message: Message = {
      id: Date.now().toString(),
      conversation_id: id as string,
      sender_id: session?.user.id!,
      content: message,
      created_at: new Date().toISOString(),
    };

    queryClient.setQueryData(["messages", id], (oldMessages: Message[]) => [
      ...oldMessages,
      new_message,
    ]);
    queryClient.setQueryData(
      ["conversations", session?.user.id],
      (conversations: ConversationType[] | undefined) => {
        if (!conversations) return conversations;

        const currentConversation = conversations.find(
          (item) => item.id === new_message.conversation_id,
        );
        if (!currentConversation) return conversations;

        const updatedConversation: ConversationType = {
          ...currentConversation,
          last_message: new_message,
        };

        return [
          updatedConversation,
          ...conversations.filter((item) => item.id !== updatedConversation.id),
        ];
      },
    );

    supabase.channel(`conversation:${id}`).send({
      type: "broadcast",
      event: "new_message",
      payload: { new_message },
    });

    sendMessageMutation();
  };

  useEffect(() => {
    if (!messages?.length) return;
    requestAnimationFrame(() => {
      messagesListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  const scrollToLatestMessage = () => {
    requestAnimationFrame(() => {
      messagesListRef.current?.scrollToEnd({ animated: false });
    });
  };

  if (!session) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-sharp" size={28} color={colors.text} />
          </TouchableOpacity>
          <Image
            source={{
              uri:
                conversation?.other_users?.[0]?.avatar_url ||
                getAvatarByName(
                  conversation?.other_users?.[0]?.full_name ?? "User",
                ),
            }}
            style={styles.conversationAvatar}
          />
          <Text style={styles.conversationName}>
            {conversation?.other_users?.[0]?.full_name ?? "User"}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flexGrow: 1, paddingVertical: 20 }}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        ) : (
          <FlatList
            ref={messagesListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToLatestMessage}
            renderItem={({ item: message }) => (
              <View
                style={[
                  styles.messageContainer,
                  message.sender_id === session?.user.id
                    ? styles.myMessageContainer
                    : styles.otherMessageContainer,
                ]}
              >
                <Text
                  style={[
                    styles.message,
                    message.sender_id === session?.user.id
                      ? styles.myMessage
                      : styles.otherMessage,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.sender_id === session?.user.id
                      ? styles.myMessageTime
                      : styles.otherMessageTime,
                  ]}
                >
                  {formatTime(message.created_at)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              !isLoading && !error ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Start a conversation</Text>
                  <Text style={styles.emptyText}>
                    Say Hi to{" "}
                    {conversation?.other_users?.[0]?.full_name ??
                      "your friend/s"}{" "}
                    👋
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={<View style={styles.messageListFooter} />}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}

        <View style={styles.inputContainer}>
          <TextField
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={(text) => setMessage(text)}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendMessage}
            style={[styles.sendBtn, isSendingMessage && { opacity: 0.5 }]}
            disabled={isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Ionicons
                name="send-outline"
                size={24}
                color={colors.background}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "space-between",
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
    conversationAvatar: {
      width: 38,
      height: 38,
      borderRadius: 24,
    },
    conversationName: {
      fontSize: 22,
      fontFamily: Fonts.bold,
      textAlign: "center",
      color: colors.text,
    },
    inputContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sendBtn: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    messagesContainer: {
      flexGrow: 1,
      paddingHorizontal: 10,
    },
    messageListFooter: {
      height: 80,
    },
    messageContainer: {
      padding: 10,
      width: "75%",
      marginVertical: 10,
    },
    myMessageContainer: {
      backgroundColor: colors.bubble.sent,
      marginLeft: "auto",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomLeftRadius: 12,
    },
    otherMessageContainer: {
      backgroundColor: colors.bubble.received,
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    message: {
      fontSize: 16,
      fontFamily: Fonts.bold,
    },
    myMessage: {
      color: colors.bubble.sentText,
    },
    otherMessage: {
      color: colors.bubble.receivedText,
    },
    messageTime: {
      fontSize: 12,
      fontFamily: Fonts.bold,
      marginLeft: "auto",
    },
    myMessageTime: {
      color: colors.bubble.sentText,
    },
    otherMessageTime: {
      color: colors.bubble.receivedText,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      gap: 8,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: Fonts.bold,
      color: colors.text,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
  });

export default Conversation;
