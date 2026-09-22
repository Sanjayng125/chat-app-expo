export const Colors = {
    light: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#387eff',
        text: '#000000',
        textSecondary: '#363638',
        border: '#E5E5EA',
        bubble: {
            sent: '#387eff',
            received: '#E5E5EA',
            sentText: '#FFFFFF',
            receivedText: '#000000',
        },
        focus: '#F0ECFF',
        error: '#ff6060',
    },
    dark: {
        background: '#000000',
        surface: '#1C1C1E',
        primary: '#518dfd',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A',
        bubble: {
            sent: '#518dfd',
            received: '#2C2C2E',
            sentText: '#FFFFFF',
            receivedText: '#FFFFFF',
        },
        focus: '#F0ECFF',
        error: '#ff6060',
    },
};

export type ColorScheme = typeof Colors.light;
