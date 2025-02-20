import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { ApphudProduct } from '@apphud/react-native-apphud-sdk';
import ApphudSdk from '@apphud/react-native-apphud-sdk';

const styles = StyleSheet.create({
  root: {
    padding: 8,
  },
  th: {
    fontWeight: 'bold',
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: '#c4c4c4',
    borderLeftWidth: 1,
    borderLeftColor: '#c4c4c4',
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  col: {
    flex: 1,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c4c4c4',
    borderRightWidth: 1,
    borderRightColor: '#c4c4c4',
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
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.th}>ID</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.th}>Price</Text>
            </View>
          </View>
          {products?.map((product: ApphudProduct, key: number) => (
            <View style={styles.row} key={key}>
              <View style={styles.col}>
                <Text>{product.id}</Text>
              </View>
              <View style={styles.col}>
                <Text>
                  {product.price ||
                    product.subscriptionOffers?.map((o) => {
                      return o.pricingPhases[0]?.formattedPrice;
                    })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
