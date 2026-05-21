import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';

export default function UpdateUserIDScreen() {
  const [userId, setUserId] = useState('');

  const onPress = () => {
    if (userId) {
      ApphudSdk.updateUserID(userId).then((user) =>
        Alert.alert('User updated', JSON.stringify(user))
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.label}>User ID</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter user id"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.button}>
          <Button title={'Update User ID'} onPress={onPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16 },
  label: { marginBottom: 8, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: { marginBottom: 12 },
  status: { marginTop: 8, color: '#333' },
});
