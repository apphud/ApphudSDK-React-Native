import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * Minimal replacements for the handful of `react-native-elements` widgets the
 * demo used. That package is unmaintained and does not support React 19, so the
 * screens render plain React Native primitives instead.
 */

type InputProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
};

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}: InputProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9aa0a6"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ title, onPress, disabled, loading }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonTitle}>{title}</Text>
      )}
    </Pressable>
  );
}

type ListItemProps = {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

type TextSlotProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

function ListItemRoot({ children, containerStyle, onPress }: ListItemProps) {
  const content = (
    <View style={[styles.listItem, containerStyle]}>{children}</View>
  );

  if (onPress == null) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.listItemPressed : undefined)}
    >
      {content}
    </Pressable>
  );
}

export const ListItem = Object.assign(ListItemRoot, {
  Content: ({ children }: { children: React.ReactNode }) => (
    <View style={styles.listItemContent}>{children}</View>
  ),
  Title: ({ children, style }: TextSlotProps) => (
    <Text style={[styles.listItemTitle, style]}>{children}</Text>
  ),
  Subtitle: ({ children, style }: TextSlotProps) => (
    <Text style={[styles.listItemSubtitle, style]}>{children}</Text>
  ),
  Chevron: () => <Text style={styles.chevron}>{'\u203A'}</Text>,
});

const styles = StyleSheet.create({
  inputContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c7c7cc',
    fontSize: 16,
    paddingVertical: 10,
    color: '#111',
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5c9e6',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listItemPressed: {
    opacity: 0.6,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    color: '#111',
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  chevron: {
    fontSize: 22,
    color: '#c7c7cc',
    marginLeft: 8,
  },
});
