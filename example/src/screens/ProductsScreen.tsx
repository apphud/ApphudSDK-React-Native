import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import type { ApphudProduct } from '@apphud/react-native-apphud-sdk';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import { common } from './styles';

const styles = StyleSheet.create({
  root: {
    padding: 8,
  },
});

export default function ProductsScreen() {
  const [products, setProducts] = React.useState<Array<ApphudProduct>>([]);

  React.useEffect(() => {
    ApphudSdk.products().then((data: Array<ApphudProduct>) => {
      setProducts(data);
    });
  }, []);

  return (
    <ScrollView>
      <View style={styles.root}>
        <View style={common.table}>
          <View style={common.row}>
            <View style={common.col}>
              <Text style={common.th}>ID</Text>
            </View>
            <View style={common.col}>
              <Text style={common.th}>Price</Text>
            </View>
          </View>
          {products?.map((product: ApphudProduct, key: number) => {
            return (
              <View style={common.row} key={key}>
                <View style={common.col}>
                  <Text>{product.productId}</Text>
                </View>
                <View style={common.col}>
                  {Platform.OS === 'ios' &&
                    Boolean(product.skProduct?.price) && (
                      <Text>{product.skProduct?.price}</Text>
                    )}
                  <Text>
                    {Platform.OS === 'android' && (
                      <Text>
                        {product.productDetails?.subscriptionOffers.map(
                          (x) => x.pricingPhases[0]?.formattedPrice
                        )}
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
