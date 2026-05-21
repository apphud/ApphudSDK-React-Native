import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import type { ApphudPlacement } from '@apphud/react-native-apphud-sdk';
import type { ApphudUser } from '@apphud/react-native-apphud-sdk';
import { ApphudSdkEventEmitter } from '@apphud/react-native-apphud-sdk';
import type { Props } from './LoginScreen';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

const 
SDK_VERSION = (require('../../../package.json') as { version?: string })
  ?.version;

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  userDetailsSection: {
    marginTop: 12,
  },
  detailsTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    paddingBottom: 10,
  },
  detailsSubtitle: {
    color: '#657086',
    fontSize: 13,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 10,
  },
  detailsKey: {
    color: '#657086',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsValue: {
    color: '#172033',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingLeft: 8,
    textAlign: 'right',
  },
  userIdValue: {
    lineHeight: 20,
    minHeight: 40,
  },
  section: {
    marginBottom: 18,
  },
  placementsSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    color: '#2f6fed',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#e9f0ff',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  placementTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  placementSubtitle: {
    color: '#657086',
    fontSize: 13,
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#657086',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  actionTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#657086',
    fontSize: 13,
    marginTop: 4,
  },
  destructiveTitle: {
    color: '#d63d3d',
  },
  separator: {
    height: 1,
    marginLeft: 16,
    backgroundColor: '#edf0f5',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 14, 24, 0.45)',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '75%',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#657086',
    fontSize: 13,
    marginTop: 4,
  },
  modalContent: {
    maxHeight: 360,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalText: {
    color: '#172033',
    fontFamily: 'Menlo',
    fontSize: 12,
    lineHeight: 18,
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: '#edf0f5',
    padding: 12,
    alignItems: 'flex-end',
  },
  modalCancelButton: {
    backgroundColor: '#172033',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default function ActionsScreen({ navigation }: Props) {
  const [placements, setPlacements] = React.useState<ApphudPlacement[]>([]);
  const [userId, setUserId] = React.useState<string>('-');
  const [userData, setUserData] = React.useState<ApphudUser | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = React.useState<
    boolean | null
  >(null);
  const [isRemoteConfigVisible, setIsRemoteConfigVisible] = React.useState(false);

  const resolvedExperimentName =
    userData?.experimentName ?? placements[0]?.experimentName ?? '-';
  const resolvedVariationName =
    userData?.variationName ?? placements[0]?.variationName ?? '-';
  const resolvedTargetingName = userData?.targetingName ?? '-';
  const resolvedTotalDevicesCount =
    typeof userData?.totalDevicesCount === 'number'
      ? String(userData.totalDevicesCount)
      : '-';
  const prettyRemoteConfig = React.useMemo(() => {
    if (!userData?.remoteConfig) {
      return 'No remote config available.';
    }

    try {
      return JSON.stringify(userData.remoteConfig, null, 2);
    } catch {
      return 'Failed to serialize remote config.';
    }
  }, [userData?.remoteConfig]);
  React.useEffect(() => {
    const unsubscribe = ApphudSdkEventEmitter.onUserDidLoad((loadedUser) => {
      setUserData(loadedUser);
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const refresh = async () => {
        const [id, premium, nextPlacements] = await Promise.all([
          ApphudSdk.userId(),
          ApphudSdk.hasPremiumAccess(),
          ApphudSdk.placements({
            forceRefresh: true,
            preferredTimeout: 21,
            maxAttempts: 4,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setUserId(id);
        setHasPremiumAccess(premium);
        setPlacements(nextPlacements);
        navigation.setOptions({ title: id });
      };

      void refresh();

      return () => {
        isMounted = false;
      };
    }, [navigation])
  );

  const callAll = () => {
    ApphudSdk.enableDebugLogs();

    // ApphudSdk.setAdvertisingIdentifier('42ed88fd-b446-4eb1-81ae-83e3025c04cf')

    // ApphudSdk.userId().then((userId) => console.log(`Apphud: userId: ${userId}`));
    ApphudSdk.hasActiveSubscription().then((active) => {
      console.log('START Has Active Subscription: = ' + active);
    });

    ApphudSdk.attributeFromWeb({
      apphud_user_id: 'aaf48728-6854-4a37-9f3b-6ab59e66b4da',
    }).then((result) => {
      console.log(
        'attribute from web result: = ' + JSON.stringify(result, null, 2)
      );
    });

    // ApphudSdk.setUserProperty({key: 'some_string_key2', value: 'some_string_valueee', setOnce: true})
    // ApphudSdk.setUserProperty({key: 'some_float_key3', value: 1.45, setOnce: true})
    // // ApphudSdk.incrementUserProperty({key: 'some2_float_ke2y', by: 2.01})
    // ApphudSdk.setUserProperty({key: ApphudUserPropertyKey.Email, value: 'user2@apphud.com', setOnce: false})
    // ApphudSdk.addAttribution({data: {network: 'Facebook2', campaign: 'Campaign', adgroup: 'AdGroup', creative: 'Creative'}, identifier: 'abc-defgee', attributionProviderId: ApphudAttributionProvider.AppsFlyer})
    // ApphudSdk.addAttribution({data: null, identifier: 'abc-xxcvcxv123345', attributionProviderId: ApphudAttributionProvider.Firebase})
    // ApphudSdk.addAttribution({data: null, identifier: 'abc22-def-token1235556', attributionProviderId: ApphudAttributionProvider.AppleSearchAds})

    // ApphudSdk.collectDeviceIdentifiers()

    // ApphudSdk.isNonRenewingPurchaseActive('com.apphud.demo.nonconsumable.premium').then(value => {
    //   console.log(`Apphud: isNonRenewingPurchaseActive: ${value}`)
    //  })

    //  ApphudSdk.nonRenewingPurchases().then(purchases => {
    //   console.log(`Apphud: nonRenewingPurchases: ${JSON.stringify(purchases)}`)
    //  })
    ApphudSdk.subscription().then((s) => {
      console.log(`Apphud: subscription: ${JSON.stringify(s)}`);
    });
    //  ApphudSdk.subscriptions().then(ss => {
    //   console.log(`Apphud: subscriptions: ${JSON.stringify(ss)}`)
    //  })
    //  ApphudSdk.paywalls().then(paywalls => {
    //   console.log(`Apphud: paywalls: ${JSON.stringify(paywalls)}`)
    //  })
    //  ApphudSdk.products().then(products => {
    //   console.log(`Apphud: products: ${JSON.stringify(products)}`)
    //  })

    // ApphudSdk.optOutOfTracking()

    //  ApphudSdk.syncPurchasesInObserverMode().then(_ => {
    //   console.log(`sync purchases finished`)
    //  })
    //  ApphudSdk.restorePurchases().then(result => {
    //   console.log(`restore purchases finished ${JSON.stringify(result)}`)
    //  })

    // if (Platform.OS == 'ios') {
    //   ApphudSdk.submitPushNotificationsToken('cc9b1656924dfdeb2a791da1da1d2afbfde35ddc8229470b73c4cf7a6a478027')
    //   ApphudSdk.handlePushNotification({userInfo: {}, screen_id: 'd33b28ea-da91-4287-b1e8-2354bcbdc633', rule_id: '1b050976-6d76-489c-9271-af4343f5bda9'})
    // }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.card, styles.userDetailsSection]}>
        <ListItem containerStyle={styles.listItem}>
          <ListItem.Content>
            <ListItem.Title style={styles.detailsTitle}>
              User Details
            </ListItem.Title>
            <ListItem.Subtitle style={styles.detailsSubtitle}>
              Current Apphud user and experiment context.
            </ListItem.Subtitle>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>User ID</Text>
              <Text
                selectable
                numberOfLines={2}
                style={[styles.detailsValue, styles.userIdValue]}
              >
                {userId || '-'}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>Experiment Name</Text>
              <Text style={styles.detailsValue}>{resolvedExperimentName}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>Variation Name</Text>
              <Text style={styles.detailsValue}>{resolvedVariationName}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>Targeting Name</Text>
              <Text style={styles.detailsValue}>{resolvedTargetingName}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>Total Devices Count</Text>
              <Text style={styles.detailsValue}>{resolvedTotalDevicesCount}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>Current SDK Version</Text>
              <Text style={styles.detailsValue}>{SDK_VERSION ?? '-'}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsKey}>Is Premium</Text>
              <Text style={styles.detailsValue}>
                {hasPremiumAccess === null ? '-' : String(hasPremiumAccess)}
              </Text>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>

      <View style={[styles.section, styles.placementsSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Placements</Text>
          <Text style={styles.badge}>{placements.length}</Text>
        </View>

        <View style={styles.card}>
          {placements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No placements loaded</Text>
              <Text style={styles.emptySubtitle}>
                Placements will appear here after the SDK returns them.
              </Text>
            </View>
          ) : (
            placements.map((placement, index) => (
              <React.Fragment key={placement.identifier}>
                {index > 0 && <View style={styles.separator} />}
                <ListItem
                  containerStyle={styles.listItem}
                  onPress={() => {
                    if (placement.paywall?.identifier) {
                      navigation.navigate('Paywall', {
                        paywallId: placement.paywall?.identifier,
                      });
                    }
                  }}
                >
                  <ListItem.Content>
                    <ListItem.Title style={styles.placementTitle}>
                      {placement.identifier}
                    </ListItem.Title>
                    <ListItem.Subtitle style={styles.placementSubtitle}>
                      {placement.paywall?.identifier ?? 'No paywall'} ·{' '}
                      {placement.paywall?.products.length ?? 0} products
                    </ListItem.Subtitle>
                  </ListItem.Content>
                  {placement.paywall?.identifier ? <ListItem.Chevron /> : null}
                </ListItem>
              </React.Fragment>
            ))
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Actions</Text>
        </View>

        <View style={styles.card}>
          <ListItem
            containerStyle={styles.listItem}
            onPress={() => navigation.navigate('Products')}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                View All Products
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Inspect every product returned by the SDK.
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={styles.separator} />
          <ListItem
            containerStyle={styles.listItem}
            onPress={() => navigation.navigate('Placements')}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                View Placements
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Open the detailed placements table.
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={styles.separator} />
          <ListItem containerStyle={styles.listItem} onPress={callAll}>
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Log SDK Functions
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Run sample SDK calls and print results to the console.
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          <View style={styles.separator} />
          <ListItem
            containerStyle={styles.listItem}
            onPress={() => navigation.navigate('SetAttribution')}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Set Attribution
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Test attribution payloads.
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={styles.separator} />
          <ListItem
            containerStyle={styles.listItem}
            onPress={() => navigation.navigate('UpdateUserID')}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Update User ID
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Change the current Apphud user identifier.
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={styles.separator} />
          <ListItem
            containerStyle={styles.listItem}
            onPress={() => setIsRemoteConfigVisible(true)}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                View Remote Config
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Open current user remote config as formatted JSON.
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </View>
      </View>

      <View style={styles.card}>
        <ListItem
          containerStyle={styles.listItem}
          onPress={() => {
            ApphudSdk.logout().then(() => {
              navigation.reset({ routes: [{ name: 'Login' }] });
            });
          }}
        >
          <ListItem.Content>
            <ListItem.Title
              style={[styles.actionTitle, styles.destructiveTitle]}
            >
              Log Out
            </ListItem.Title>
            <ListItem.Subtitle style={styles.actionSubtitle}>
              End this demo session and return to login.
            </ListItem.Subtitle>

          </ListItem.Content>
        </ListItem>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isRemoteConfigVisible}
        onRequestClose={() => setIsRemoteConfigVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Remote Config</Text>
              <Text style={styles.modalSubtitle}>
                Scroll and long-press text to copy.
              </Text>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text selectable style={styles.modalText}>
                {prettyRemoteConfig}
              </Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setIsRemoteConfigVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
