import * as React from 'react';
import { View } from 'react-native';
import { Input, Button } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';
import type { StackScreenProps } from '@react-navigation/stack';

export type Props = StackScreenProps<any>;

export default function HomeScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = React.useState<string>(
    'app_4sY9cLggXpMDDQMmvc5wXUPGReMp8G'
  );
  const [userId, setUserId] = React.useState<any>(null);
  const [deviceId, setDeviceId] = React.useState<any>(null);
  const onStartHandler = () => {
    ApphudSdk.start({
      apiKey,
      userId,
      deviceId,
    }).then(() => {
      navigation.navigate('Actions');
    });
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input placeholder="apiKey" value={apiKey} onChangeText={setApiKey} />
      <Input placeholder="userId" value={userId} onChangeText={setUserId} />
      <Input
        placeholder="deviceId"
        value={deviceId}
        onChangeText={setDeviceId}
      />
      <Button type="solid" title="Start" onPress={onStartHandler} />
    </View>
  );
}
