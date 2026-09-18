export const Colors = {
    light: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#5528e9',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#E5E5EA',
        bubble: {
            sent: '#5528e9',
            received: '#E5E5EA',
            sentText: '#FFFFFF',
            receivedText: '#000000',
        },
    },
    dark: {
        background: '#000000',
        surface: '#1C1C1E',
        primary: '#7f4af5',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A',
        bubble: {
            sent: '#7f4af5',
            received: '#2C2C2E',
            sentText: '#FFFFFF',
            receivedText: '#FFFFFF',
        },
    },
};

export type ColorScheme = typeof Colors.light;
