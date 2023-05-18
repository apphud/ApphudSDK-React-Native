import * as React from 'react';
import { Alert, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';

export default function PurchaseScreen() {
  const [productId, setProductId] = React.useState<any>('com.apphud.lifetime');
  const [paywallId, setPaywallId] = React.useState<any>('e2313cea');
  const onPurchaseHandler = () => {
    ApphudSdk.purchaseProduct({ productId, paywallId }).then((result) => {
      Alert.alert('purchase result', JSON.stringify(result));
    });
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Input
        placeholder="Product Identifier"
        value={productId}
        onChangeText={setProductId}
      />
      <Input
        placeholder="Paywall Identifier"
        value={paywallId}
        onChangeText={setPaywallId}
      />
      <Button type="solid" title="Purchase" onPress={onPurchaseHandler} />
    </View>
  );
}
