import { ColorScheme } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { useMemo, useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function TextField(props: TextInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TextInput
      {...props}
      style={[styles.input, isFocused && styles.inputFocused, props.style]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    input: {
      marginTop: 20,
      width: "100%",
      height: 50,
      borderRadius: 10,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: "transparent",
      fontFamily: Fonts.regular,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.focus,
    },
  });
