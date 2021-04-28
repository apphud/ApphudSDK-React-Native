import * as React from 'react';
import { Alert, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';

export default function PurchaseScreen() {
  const [productId, setProductId] = React.useState<any>(null);
  const onPurchaseHandler = () => {
    ApphudSdk.purchase(productId)
      .then((result) => {
        Alert.alert('purchase result', JSON.stringify(result));
      })
      .catch((e) => {
        Alert.alert('purchase failed', e.message);
      });
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input
        placeholder="Product Identifier"
        value={productId}
        onChangeText={setProductId}
      />
      <Button type="solid" title="Purchase" onPress={onPurchaseHandler} />
    </View>
  );
}
