import { Colors, ColorScheme } from "@/constants/colors"
import { useThemeStore } from "@/stores/themeStore"

interface Theme {
    theme: string
    toggleTheme: () => void
    colors: ColorScheme
}

export const useTheme = (): Theme => {
    const { theme, toggleTheme } = useThemeStore()

    return { theme, toggleTheme, colors: theme === "dark" ? Colors.dark : Colors.light }
}
