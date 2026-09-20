import ConversationItem from "@/components/chat/ConversationItem";
import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useConversations } from "@/hooks/useConversations";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { getAvatarByName } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { user } = useAuthStore();
  const { conversations, isLoading, error, refetch, isRefetching } =
    useConversations();
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Convo</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={{ padding: 8 }} activeOpacity={0.6}>
            <Ionicons name="search-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }} activeOpacity={0.6}>
            <Image
              source={{
                uri:
                  user?.avatar_url ??
                  getAvatarByName(user?.full_name ?? "User"),
              }}
              style={styles.myAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item: conversation }) => {
            return <ConversationItem conversation={conversation} />;
          }}
          ListEmptyComponent={
            <>
              {!isLoading && !error && (
                <View style={styles.emptyContainer}>
                  <Image
                    source={require("@assets/images/add-conversation.png")}
                    style={styles.addConversation}
                  />
                  <Text style={styles.emptyText}>No conversations yet</Text>
                  <Text style={styles.emptyText}>
                    Search for a friend to start
                  </Text>
                </View>
              )}
              {error && !isLoading && (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.error }]}>
                    {error.message}
                  </Text>
                </View>
              )}
            </>
          }
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}

      <TouchableOpacity
        style={styles.addConversationBtn}
        activeOpacity={0.8}
        onPress={() => router.push("/(app)/new-conversation")}
      >
        <Ionicons name="add-outline" size={30} color={colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      flexGrow: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontFamily: Fonts.extraBold,
      textAlign: "center",
      color: colors.text,
    },
    logo: {
      width: 50,
      height: 50,
    },
    myAvatar: {
      width: 32,
      height: 32,
      borderRadius: 20,
    },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    emptyContainer: {
      flex: 0.6,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 18,
      color: colors.text,
      fontFamily: Fonts.bold,
    },
    addConversation: {
      width: 250,
      height: 250,
    },
    addConversationBtn: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.primary,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default Home;
