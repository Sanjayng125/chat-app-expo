import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createJSONStorage, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
    theme: Theme
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () => {
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                }))
            },
        }),
        {
            name: 'themeStore',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ theme: state.theme }),
        }
    )
)
