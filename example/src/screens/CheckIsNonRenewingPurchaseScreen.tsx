import * as React from 'react';
import { Alert, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';

export default function CheckIsNonRenewingPurchaseScreen() {
  const [productId, setProductId] = React.useState<any>(null);
  const onCheckHandler = () => {
    ApphudSdk.isNonRenewingPurchaseActive(productId)
      .then((result) => {
        Alert.alert('Purchase status', result ? 'active' : 'non-active');
      })
      .catch((err: Error) => Alert.alert('error', err.message));
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input
        placeholder="Product Identifier"
        value={productId}
        onChangeText={setProductId}
      />
      <Button type="solid" title="Purchase" onPress={onCheckHandler} />
    </View>
  );
}
