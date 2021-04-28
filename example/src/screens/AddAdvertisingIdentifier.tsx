import * as React from 'react';
import { Alert, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';

export default function AddAttributionScreen() {
  const [identifier, setIdentifier] = React.useState<any>(null);
  const onSave = () => {
    ApphudSdk.setAdvertisingIdentifier(identifier).then((e) => {
      Alert.alert('Added Advertising ID', JSON.stringify(e));
    });
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input
        placeholder="Identifier"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <Button type="solid" title="Save attribution" onPress={onSave} />
    </View>
  );
}
