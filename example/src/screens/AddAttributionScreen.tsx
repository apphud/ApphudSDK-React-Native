import * as React from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import ApphudSdk, {
  AndroidApphudAttributionProvider,
  IOSApphudAttributionProvider,
} from '@apphud/react-native-apphud-sdk';

export default function AddAttributionScreen() {
  const [data, setData] = React.useState<any>({ a: 1, b: 2, c: 3 });
  const [identifier, setIdentifier] = React.useState<any>(null);
  const onSave = () => {
    ApphudSdk.addAttribution({
      data,
      identifier,
      attributionProviderId:
        Platform.OS === 'android'
          ? AndroidApphudAttributionProvider.adjust
          : IOSApphudAttributionProvider.Adjust,
    }).then((e) => {
      Alert.alert('syncPurchases', JSON.stringify(e));
    });
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input
        placeholder="Data"
        value={JSON.stringify(data)}
        onChangeText={(text) => setData(JSON.parse(text))}
      />
      <Input
        placeholder="Identifier"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <Input placeholder="Provider id" value=".adjust" />
      <Button type="solid" title="Save attribution" onPress={onSave} />
    </View>
  );
}
