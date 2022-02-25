import * as React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import ApphudSdk, { ApphudProduct } from '@apphud/react-native-apphud-sdk';
import { Button } from 'react-native-elements';

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
  const onPurchase = (productId: string) => {
    ApphudSdk.purchase(productId).then((result) => {
      Alert.alert('purchase result', JSON.stringify(result));
    });
  };
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
            <View style={styles.col}>
              <Text style={styles.th}>Action</Text>
            </View>
          </View>
          {products?.map((product: ApphudProduct, key: number) => (
            <View style={styles.row} key={key}>
              <View style={styles.col}>
                <Text>{product.id}</Text>
              </View>
              <View style={styles.col}>
                <Text>{product.price}</Text>
              </View>
              <View style={styles.col}>
                <Button
                  title="Purchase"
                  onPress={() => onPurchase(product.id)}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
