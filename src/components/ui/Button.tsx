import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type ButtonProps = {
  txtStyles?: StyleProp<TextStyle>;
  text?: string;
  loading?: boolean;
} & TouchableOpacityProps;

export default function Button({
  style: btnStyles,
  txtStyles,
  onPress,
  text,
  children,
  loading,
}: ButtonProps) {
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[btnStyles, styles.button, loading && { opacity: 0.5 }]}
      disabled={loading}
      onPress={onPress}
    >
      {text && <Text style={[txtStyles, styles.buttonText]}>{text}</Text>}
      {!text && children}
      {loading && <ActivityIndicator size="small" color={colors.background} />}
    </TouchableOpacity>
  );
}

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    button: {
      marginTop: 20,
      width: "100%",
      height: 50,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      flexDirection: "row",
      gap: 8,
      overflow: "hidden",
    },
    buttonText: {
      color: colors.background,
      fontSize: 18,
      fontFamily: Fonts.bold,
    },
  });
