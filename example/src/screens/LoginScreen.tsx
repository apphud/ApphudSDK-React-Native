import * as React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import type { StackScreenProps } from '@react-navigation/stack';
import { APPHUD_API_KEY, APPHUD_HOST } from '@env';

export type Props = StackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = React.useState<string>(
    APPHUD_API_KEY ?? ''
  );

  const [userId, setUserId] = React.useState<any>(null);
  const [deviceId, setDeviceId] = React.useState<any>(null);

  const onStartHandler = async () => {
    const resolvedApiKey = apiKey.trim() || APPHUD_API_KEY?.trim() || '';
    if (!resolvedApiKey) {
      throw new Error(
        'Missing APPHUD_API_KEY. Add APPHUD_API_KEY to example/.env.'
      );
    }

    const resolvedHost = APPHUD_HOST?.trim();
    if (resolvedHost) {
      await ApphudSdk.setHost(resolvedHost);
    }

    await ApphudSdk.start({
      apiKey: resolvedApiKey,
      userId,
      deviceId,
      observerMode: false,
    });
    await ApphudSdk.setDeviceIdentifiers({
      idfv: (await ApphudSdk.idfv()) ?? undefined,
    });

    navigation.replace('Actions');
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
      <Button type="solid" title="Start" onPress={onStartHandler} />
    </KeyboardAvoidingView>
  );
}
