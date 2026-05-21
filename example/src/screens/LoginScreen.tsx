import * as React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import type { StackScreenProps } from '@react-navigation/stack';

export type Props = StackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = React.useState<string>(
    'play_nwpk5ACtwcppKS4rB9qL9ymA4PfjCN77uQa'
  );

  const [userId, setUserId] = React.useState<any>(null);
  const [deviceId, setDeviceId] = React.useState<any>(null);

  const onStartHandler = async () => {
    await ApphudSdk.setHost('https://api.apphuddev.com');
      setApiKey('play_nwpk5ACtwcppKS4rB9qL9ymA4PfjCN77uQa');
    
    await ApphudSdk.start({ apiKey, userId, deviceId, observerMode: false });
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
