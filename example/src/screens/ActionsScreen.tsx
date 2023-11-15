import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import ApphudSdk, { ApphudAttributionProvider, ApphudUserPropertyKey } from '@apphud/react-native-apphud-sdk';
import type { ApphudPaywall } from '@apphud/react-native-apphud-sdk';
import type { Props } from './LoginScreen';
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

  const logAll = () => {
    ApphudSdk.enableDebugLogs();
    ApphudSdk.userId().then((userId) => console.log(`Apphud: userId: ${userId}`));
    ApphudSdk.hasActiveSubscription().then((hasActiveSubscription) => 
      console.log(`Apphud: hasActiveSubscription: ${hasActiveSubscription}`)
      );
    ApphudSdk.hasPremiumAccess().then((hasPremiumAccess) => 
      console.log(`Apphud: hasPremiumAccess: ${hasPremiumAccess}`)
    );
    ApphudSdk.setAdvertisingIdentifier('42ed88fd-b446-4eb1-81ae-83e3025c04cf')
    ApphudSdk.setUserProperty('some_key', 'some_value', false)
    ApphudSdk.setUserProperty('some_float_key', 0.35, true)
    ApphudSdk.setUserProperty(ApphudUserPropertyKey.Email, 'user@apphud.com', false)
    ApphudSdk.addAttribution({data: {network: 'Facebook', campaign: 'Campaign', adgroup: 'AdGroup', creative: 'Creative'}, identifier: 'abc-def', attributionProviderId: ApphudAttributionProvider.AppsFlyer})
    ApphudSdk.addAttribution({data: null, identifier: 'abc-def-token', attributionProviderId: ApphudAttributionProvider.AppleSearchAds})
    ApphudSdk.collectDeviceIdentifiers()
    ApphudSdk.incrementUserProperty('some_float_key', 2.01)
    ApphudSdk.isNonRenewingPurchaseActive('com.apphud.demo.nonconsumable.premium').then(value => { 
      console.log(`Apphud: isNonRenewingPurchaseActive: ${value}`)
     })

     ApphudSdk.nonRenewingPurchases().then(purchases => {
      console.log(`Apphud: nonRenewingPurchases: ${JSON.stringify(purchases)}`)
     })
     ApphudSdk.subscription().then(s => {
      console.log(`Apphud: subscription: ${JSON.stringify(s)}`)
     })
     ApphudSdk.subscriptions().then(ss => {
      console.log(`Apphud: subscriptions: ${JSON.stringify(ss)}`)
     })
     ApphudSdk.paywalls().then(paywalls => {
      console.log(`Apphud: paywalls: ${JSON.stringify(paywalls)}`)
     })
     ApphudSdk.products().then(products => {
      console.log(`Apphud: products: ${JSON.stringify(products)}`)
     })
     ApphudSdk.optOutOfTracking()
     ApphudSdk.syncPurchasesInObserverMode().then(_ => {
      console.log(`sync purchases finished`)
     })
     ApphudSdk.restorePurchases().then(result => {
      console.log(`restore purchases finished ${JSON.stringify(result)}`)
     })
     
  }

  return (
    <ScrollView>
    <View style={{ flex: 1 }}>
      
      <ListItem>
        <ListItem.Title style={boldStyles.customText}>Paywalls ({ paywalls?.length }) </ListItem.Title>
      </ListItem>

      {  
        paywalls?.map((paywall, index) => (
          <ListItem key={index} onPress={() => {
            navigation.navigate('Paywall', { paywallId: paywall.identifier })
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
            onPress={logAll}
          >
            <ListItem.Content>
              <ListItem.Title>Log All Functions to Console</ListItem.Title>
            </ListItem.Content>
          </ListItem>

          <ListItem
            onPress={ () => {
              ApphudSdk.logout()
              navigation.navigate('Home')
            }}
          >
            <ListItem.Content>
              <ListItem.Title>Log Out</ListItem.Title>
            </ListItem.Content>
          </ListItem>
    </View>
    </ScrollView>
  );
}
