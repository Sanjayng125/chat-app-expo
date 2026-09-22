import UserItem from "@/components/user/UserItem";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebounce } from "@/hooks/useDebounce";
import { useTheme } from "@/hooks/useTheme";
import { createConversation } from "@/services/conversations";
import { searchUsers } from "@/services/users";
import { useAuthStore } from "@/stores/authStore";
import { Conversation, User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const NewConversation = () => {
  const { session } = useAuthStore();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: users = [],
    isFetching: isSearchingUsers,
    isFetched: isSearchedUsers,
    error: searchError,
  } = useQuery({
    queryKey: ["searchUsers", debouncedSearchQuery],
    queryFn: () => {
      const users = searchUsers({
        query: debouncedSearchQuery,
        currentUserId: session?.user.id!,
      });

      return users;
    },
    enabled: !!debouncedSearchQuery,
  });

  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    mutate: createConversationMutation,
    isPending: isCreatingConversation,
  } = useMutation({
    mutationFn: async (user: User) => {
      const conversation = await createConversation({
        currentUserId: session?.user.id!,
        otherUserId: user.id,
      });

      return conversation;
    },
    onSuccess: async (conversation: Conversation) => {
      await queryClient.refetchQueries({
        queryKey: ["conversations", session?.user.id],
      });
      router.replace(`/(app)/conversation/${conversation.id}`);
    },
    onError: (error: Error | PostgrestError) => {
      console.log("Error: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    },
  });

  const handleUserClick = async (user: User) => {
    if (isCreatingConversation) return;

    createConversationMutation(user);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-sharp" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.searchTitle}>New Conversation</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search for a friend..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearchingUsers && (
            <ActivityIndicator
              size="small"
              color={colors.text}
              style={styles.searchLoader}
            />
          )}
        </View>
      </View>

      {searchError && <Text style={styles.error}>{searchError.message}</Text>}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item: user }) => (
          <UserItem
            user={user}
            isLoading={isCreatingConversation}
            onPress={() => handleUserClick(user)}
          />
        )}
        ListEmptyComponent={
          <>
            {isSearchedUsers && !isSearchingUsers && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            )}
            {!isSearchedUsers && (
              <View style={styles.emptyContainer}>
                <Image
                  style={styles.emptyImage}
                  source={require("@assets/images/search-user-new-conversation.png")}
                />
                <Text style={styles.emptyText}>Search for a friend</Text>
                <Text style={styles.emptyText}>to start a conversation</Text>
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    backBtn: {
      paddingHorizontal: 4,
    },
    searchTitle: {
      fontSize: 20,
      fontFamily: Fonts.extraBold,
      color: colors.text,
    },
    searchContainer: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.bold,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    searchLoader: {
      position: "absolute",
      right: 0,
      paddingHorizontal: 10,
      paddingVertical: 14,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    error: {
      fontSize: 16,
      color: colors.error,
      fontFamily: Fonts.bold,
      marginTop: 10,
      textAlign: "center",
    },
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.bold,
    },
    emptyImage: {
      width: 250,
      height: 250,
    },
  });

export default NewConversation;
