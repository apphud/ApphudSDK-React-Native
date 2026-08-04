import * as React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { Input, Button } from '../components/ui';
import type { StackScreenProps } from '@react-navigation/stack';
import { getDefaultApiKey, startApphudSession } from '../session';

export type Props = StackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = React.useState<string>(getDefaultApiKey());
  const [userId, setUserId] = React.useState<string>('');
  const [deviceId, setDeviceId] = React.useState<string>('');
  const [isStarting, setIsStarting] = React.useState(false);

  const onStartHandler = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);
    try {
      await startApphudSession({
        apiKey,
        userId: userId || null,
        deviceId: deviceId || null,
      });
      navigation.replace('Actions');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Input placeholder="apiKey" value={apiKey} onChangeText={setApiKey} />
      <Input placeholder="userId" value={userId} onChangeText={setUserId} />
      <Input
        placeholder="deviceId"
        value={deviceId}
        onChangeText={setDeviceId}
      />
      <Button
        title="Start"
        onPress={onStartHandler}
        disabled={isStarting}
        loading={isStarting}
      />
    </KeyboardAvoidingView>
  );
}
