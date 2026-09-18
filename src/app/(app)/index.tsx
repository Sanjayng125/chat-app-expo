import Button from "@/components/ui/Button";
import { signOut } from "@/services/auth";
import { Text, View } from "react-native";

const Home = () => {
  return (
    <View>
      <Text>Home</Text>
      <Button onPress={async () => await signOut()} text="Sign-Out" />
    </View>
  );
};

export default Home;
