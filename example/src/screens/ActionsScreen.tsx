import * as React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';
import type { ApphudPaywall } from '@apphud/react-native-apphud-sdk';
import type { Props } from './HomeScreen';
import { ScrollView } from 'react-native-gesture-handler';

const boldStyles = StyleSheet.create({
  customText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  italicText: {
    fontStyle: 'italic',
  },
});


export default function ActionsScreen({ navigation }: Props) {
  const errorHandler = (err: Error) => Alert.alert('error', err.message);
  React.useEffect(() => {
    ApphudSdk.userId().then(userId => {
      navigation.setOptions({
        title: userId, // Set the new title here
      });
    })
    
  }, [navigation]);
  
  React.useEffect(() => {
    const loadPaywalls = navigation.addListener('focus', () => {
      // This function will be called when the view appears
      paywallsLoaded
    });

    return loadPaywalls;
  }, []);

  const paywallsLoaded = ApphudSdk.paywalls().then((data) => {
    setPaywalls(data)
  });

  const [paywalls, setPaywalls] = React.useState<Array<ApphudPaywall>>();

  return (
    <ScrollView>
    <View style={{ flex: 1 }}>
      
      <ListItem>
        <ListItem.Title style={boldStyles.customText}>Paywalls ({ paywalls?.length }) </ListItem.Title>
      </ListItem>

      {  
        paywalls?.map((paywall, index) => (
          <ListItem key={index} onPress={() => {
           //updatePaywall(paywall)
            navigation.navigate('Paywall', { paywallId: paywall.identifier })
            //navigation.navigation.navigate('Paywall', { paywall: paywall });
          }}>
            <ListItem.Content>
              <ListItem.Title style={boldStyles.italicText}> {'->>>'} { paywall.identifier } ({paywall.products.length}) </ListItem.Title>  
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))
       }
       <ListItem>
        <ListItem.Title style={boldStyles.customText}>Other Actions </ListItem.Title>
      </ListItem>

      <ListItem onPress={() => navigation.navigate('Products')}>
        <ListItem.Content>
          <ListItem.Title>View All Products</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem
        onPress={() =>
          ApphudSdk.hasActiveSubscription()
            .then((bool) =>
              Alert.alert('hasActiveSubscription', bool ? 'Yes' : 'No')
            )
            .catch(errorHandler)
        }
      >
        <ListItem.Content>
          <ListItem.Title>ApphudSdk.hasActiveSubscription</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      
      
      <ListItem
        onPress={() => {
          ApphudSdk.nonRenewingPurchases()
            .then((purchases) => {
              Alert.alert('purchases', JSON.stringify(purchases));

              if (purchases.length > 0) {
                ApphudSdk.isNonRenewingPurchaseActive(purchases[0].productId).then(result => {
                  console.log(`PURCHASE IS ACTIVE: ${result}`)
                })                  
              }

            })
            .catch(errorHandler);
        }}
      >
        <ListItem.Content>
          <ListItem.Title>ApphudSdk.nonRenewingPurchases</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem
            onPress={() => {
              ApphudSdk.subscription()
                .then((subscription) => {
                  Alert.alert('subscription', JSON.stringify(subscription));
                })
                .catch(errorHandler);
            }}
          >
            <ListItem.Content>
              <ListItem.Title>ApphudSdk.subscription</ListItem.Title>
            </ListItem.Content>
          </ListItem>      
      <ListItem
            onPress={() => {
              ApphudSdk.subscriptions()
                .then((subscriptions) => {
                  Alert.alert('subscriptions', JSON.stringify(subscriptions));
                })
                .catch(errorHandler);
            }}
          >
            <ListItem.Content>
              <ListItem.Title>ApphudSdk.subscriptions</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem
            onPress={() => {
              ApphudSdk.restorePurchases()
                .then(() => {
                  Alert.alert('Restore purchases', 'success');
                })
                .catch(errorHandler);
            }}
          >
            <ListItem.Content>
              <ListItem.Title>ApphudSdk.restorePurchases</ListItem.Title>
            </ListItem.Content>
          </ListItem>
    </View>
    </ScrollView>
  );
}
