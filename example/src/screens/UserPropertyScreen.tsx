import * as React from 'react';
import { Alert, CheckBox, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';

export default function UserPropertyScreen() {
  const [key, setKey] = React.useState<any>(null);
  const [value, setValue] = React.useState<any>(null);
  const [once, setOnce] = React.useState<any>(false);

  const successAlert = () => Alert.alert('Done');
  const errorAlert = (e: any) => Alert.alert('Error', e?.message);
  const onSetHandler = () => {
    ApphudSdk.setUserProperty(key, value, once)
      .then(successAlert)
      .catch(errorAlert);
  };
  const onIncrementHandler = () => {
    ApphudSdk.incrementUserProperty(key, value)
      .then(successAlert)
      .catch(errorAlert);
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input placeholder="Key" value={key} onChangeText={setKey} />
      <Input placeholder="Value" value={value} onChangeText={setValue} />
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          flexDirection: 'row',
        }}
      >
        <CheckBox value={once} onValueChange={setOnce} />
        <Text>Set once</Text>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Button type="solid" title="Set" onPress={onSetHandler} />
        <Button type="solid" title="Increment" onPress={onIncrementHandler} />
      </View>
    </View>
  );
}
