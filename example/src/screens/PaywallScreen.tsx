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
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
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

function prepareProducts(products: ApphudProduct[]): ProductProps[] {
  if (Platform.OS === 'ios') {
    return products.map((product) => {
      const price = product.skProduct?.price ?? 0;

      return {
        productId: product.productId,
        price,
        formattedPrice: `${price} ${
          product.skProduct?.priceLocale.currencyCode ?? '$'
        }`,
      };
    });
  }

  return products.flatMap((product) => {
    if (product.productDetails?.oneTimePurchaseOffer) {
      return {
        productId: product.productId,
        price: product.productDetails.oneTimePurchaseOffer.price,
        formattedPrice:
          product.productDetails.oneTimePurchaseOffer.formattedPrice ?? '',
      };
    }

    if (product.productDetails?.subscriptionOffers) {
      return product.productDetails.subscriptionOffers.map((offer) => ({
        productId: product.productId,
        price: offer.pricingPhases?.[0]?.price ?? 0,
        formattedPrice: offer.pricingPhases?.[0]?.formattedPrice ?? '',
        basePlanId: offer.basePlanId,
        offerToken: offer.offerToken,
        offerId: offer.offerId,
      }));
    }

    return [];
  });
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

  React.useEffect(() => {
    const findPaywall = async () => {
      const paywalls = (await ApphudSdk.placements())
        .map((x) => x.paywall)
        .filter((x) => x) as ApphudPaywall[];

      for (const paywall of paywalls) {
        if (paywall.identifier === route.params.paywallId) {
          setCurrentPaywall(paywall);

          ApphudSdk.paywallShown({
            paywallIdentifier: paywall.identifier,
            placementIdentifier: paywall.placementIdentifier,
          });

          setProductsProps(prepareProducts(paywall.products));
          return paywall;
        }
      }

      throw new Error('Paywall not found');
    };

    findPaywall()
      .then((paywall) => {
        navigation.setOptions({
          title: paywall.identifier ?? 'Paywall',
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, [navigation, route.params.paywallId]);

  const onPurchase = (product: ProductProps) => {
    const options: ApphudPurchaseProps = {
      productId: product.productId,
      paywallIdentifier: currentPaywall?.identifier,
      placementIdentifier: currentPaywall?.placementIdentifier,
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
        {currentPaywall ? (
          <>
            <Button
              title="Display paywall screen"
              onPress={() =>
                ApphudSdk.displayPaywallScreen(
                  {
                    placementIdentifier: currentPaywall.placementIdentifier,
                  },
                  (product) => console.log('transaction started', product),
                  () => console.log('fineshed'),
                  (error) => console.log('error', error)
                )
              }
            />
            <Button
              title="Navigate to screen"
              onPress={() => {
                navigation.navigate('PaywallNativeScreen', {
                  placementIdentifier: currentPaywall.placementIdentifier,
                });
              }}
            />
          </>
        ) : null}
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
