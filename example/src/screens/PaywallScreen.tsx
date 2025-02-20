import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import type {
  ApphudPaywall,
  ApphudProduct,
  ApphudPurchaseProps,
} from '@apphud/react-native-apphud-sdk';
import ApphudSdk from '@apphud/react-native-apphud-sdk';
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

interface ProductProps {
  productId: string;
  price: number;
  formattedPrice: string;
  basePlanId?: string;
  offerToken?: string;
  offerId?: string;
}

export default function PaywallScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const [currentPaywall, setCurrentPaywall] = React.useState<ApphudPaywall>();
  const [productsProps, setProductsProps] = React.useState<Array<ProductProps>>(
    []
  );

  const findPaywall = async () => {
    const paywalls = await ApphudSdk.paywalls();
    for (const paywall of paywalls) {
      if (paywall.identifier === route.params.paywallId) {
        setCurrentPaywall(paywall);
        await ApphudSdk.paywallShown(paywall.identifier);
        const productsPropsList: ProductProps[] = preparedProducts(
          paywall.products
        );
        setProductsProps(productsPropsList);
        return paywall;
      }
    }

    throw new Error('Paywall not found');
  };

  React.useEffect(() => {
    findPaywall()
      .then((paywall) => {
        navigation.setOptions({
          title: paywall.identifier || 'Paywall',
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, [navigation]);

  const onPurchase = (product: ProductProps) => {
    const options: ApphudPurchaseProps = {
      productId: product.productId,
      paywallId: currentPaywall?.identifier,
      offerToken: product?.offerToken,
      isConsumable:
        !product.basePlanId &&
        product.productId !== 'com.apphud.demo.nonconsumable.premium',
    };

    // Alert.alert('will purchase ', JSON.stringify(options));

    ApphudSdk.purchase(options).then((result) => {
      Alert.alert('Purchase Result = ', JSON.stringify(result));
    });
  };

  const preparedProducts = (products: ApphudProduct[]) => {
    // Alert.alert('paywall products= ', JSON.stringify(products));

    return products.flatMap((product) => {
      if (Platform.OS === 'ios') {
        return {
          productId: product.id,
          price: product.price || 0,
          formattedPrice: `${product.price || 0} ${
            product.priceLocale?.currencyCode || '$'
          }`,
        };
      } else if (product.oneTimePurchaseOffer != null) {
        return ([product.oneTimePurchaseOffer] || []).map((offer) => ({
          productId: product.id,
          price: offer.price,
          formattedPrice: offer.formattedPrice || '',
        }));
      } else {
        return (product.subscriptionOffers || []).map((offer) => ({
          productId: product.id,
          price: offer.pricingPhases?.[0]?.price || product.price || 0,
          formattedPrice:
            offer.pricingPhases?.[0]?.formattedPrice ||
            product.price?.toString() ||
            '',
          basePlanId: offer.basePlanId,
          offerToken: offer.offerToken,
          offerId: offer.offerId,
        }));
      }
    });
  };

  return (
    <ScrollView>
      <Text
        onPress={() => {
          Alert.alert('Products', JSON.stringify(productsProps));
        }}
      >
        {' '}
        Paywall ID: {currentPaywall?.identifier}
      </Text>
      <Text> Experiment: {currentPaywall?.experimentName || 'N/A'}</Text>
      {/* <Text> Custom JSON: { currentPaywall?.json }</Text> */}
      <View style={styles.root}>
        <View style={styles.table}>
          <View style={styles.row}></View>
          {productsProps.map((product: ProductProps, key: number) => (
            <View key={key}>
              <Text style={styles.row}>
                ProductId: {product.productId}
                {'\n'}
                BasePlanId: {product.basePlanId || 'N/A'}
                {'\n'}
                OfferId: {product.offerId || 'N/A'}
                {'\n'}
              </Text>
              <Button
                title={`Buy for ${product.formattedPrice}`}
                onPress={() => onPurchase(product)}
              />
              <Text>{'\n\n'}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
