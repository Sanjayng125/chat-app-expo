export const Colors = {
    light: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#7f28e9',
        text: '#000000',
        textSecondary: '#363638',
        border: '#E5E5EA',
        bubble: {
            sent: '#7f28e9',
            received: '#E5E5EA',
            sentText: '#FFFFFF',
            receivedText: '#000000',
        },
        focus: '#F0ECFF',
    },
    dark: {
        background: '#000000',
        surface: '#1C1C1E',
        primary: '#8a38ee',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A',
        bubble: {
            sent: '#8a38ee',
            received: '#2C2C2E',
            sentText: '#FFFFFF',
            receivedText: '#FFFFFF',
        },
        focus: '#F0ECFF',
    },
};

export type ColorScheme = typeof Colors.light;
