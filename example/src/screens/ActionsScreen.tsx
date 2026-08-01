import * as React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ListItem } from '../components/ui';
import {
  ApphudSdk,
  ApphudUserPropertyKey,
} from '@apphud/react-native-apphud-sdk';
import type { ApphudPlacement } from '@apphud/react-native-apphud-sdk';
import type { ApphudUser } from '@apphud/react-native-apphud-sdk';
import { ApphudSdkEventEmitter } from '@apphud/react-native-apphud-sdk';
import type { Props } from './LoginScreen';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { submitExamplePushToken } from '../push';
import { clearStoredApiKey } from '../session';

const SDK_VERSION = (require('../../../package.json') as { version?: string })
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
  const [isRemoteConfigVisible, setIsRemoteConfigVisible] =
    React.useState(false);

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

  const requestDeferredDeeplinkAttribution = async () => {
    try {
      await ApphudSdk.requestDeferredDeeplinkAttribution();
      console.log('Requested deferred deeplink attribution');
    } catch (error) {
      console.log('Failed to request deferred deeplink attribution:', error);
    }
  };

  const checkRules = async () => {
    try {
      await ApphudSdk.checkRules();
      console.log('checkRules completed');
    } catch (error) {
      console.log('Failed to checkRules:', error);
    }
  };

  const logPendingRule = async () => {
    try {
      const rule = await ApphudSdk.pendingRule();
      console.log('pendingRule:', JSON.stringify(rule));
    } catch (error) {
      console.log('Failed to get pendingRule:', error);
    }
  };

  const showPendingRuleScreen = async () => {
    try {
      const shown = await ApphudSdk.showPendingRuleScreen();
      console.log('showPendingRuleScreen shown:', shown);
    } catch (error) {
      console.log('Failed to showPendingRuleScreen:', error);
    }
  };

  const submitPushToken = async () => {
    await submitExamplePushToken();
  };

  const callAll = () => {
    const log = (label: string, value?: unknown) => {
      if (value === undefined) {
        console.log(`[ApphudExample] ${label}`);
      } else {
        console.log(`[ApphudExample] ${label}`, value);
      }
    };

    ApphudSdk.enableDebugLogs();

    ApphudSdk.userId().then((id) => log(`userId = ${id}`));

    ApphudSdk.hasActiveSubscription().then((active) => {
      log(`hasActiveSubscription = ${active} (typeof ${typeof active})`);
    });

    ApphudSdk.attributeFromWeb({
      apphud_user_id: 'aaf48728-6854-4a37-9f3b-6ab59e66b4da',
    }).then((result) => {
      log('attributeFromWeb =', JSON.stringify(result, null, 2));
    });

    // --- Previously commented-out calls below, now exercised & logged ---

    ApphudSdk.setUserProperty({
      key: 'some_string_key2',
      value: 'some_string_valueee',
      setOnce: true,
    });
    log('setUserProperty(some_string_key2) sent (fire-and-forget)');

    ApphudSdk.setUserProperty({
      key: 'some_float_key3',
      value: 1.45,
      setOnce: true,
    });
    log('setUserProperty(some_float_key3) sent (fire-and-forget)');

    ApphudSdk.setUserProperty({
      key: ApphudUserPropertyKey.Email,
      value: 'user2@apphud.com',
      setOnce: false,
    });
    log('setUserProperty($email) sent (fire-and-forget)');

    ApphudSdk.incrementUserProperty({ key: 'some2_float_key2', by: 2.01 });
    log('incrementUserProperty(some2_float_key2) sent (fire-and-forget)');

    // Android only; SDK no-ops this call on iOS.
    ApphudSdk.collectDeviceIdentifiers();
    log(`collectDeviceIdentifiers() sent (${Platform.OS})`);

    ApphudSdk.isNonRenewingPurchaseActive(
      'com.apphud.demo.nonconsumable.premium'
    ).then((value) => {
      log(`isNonRenewingPurchaseActive = ${value} (typeof ${typeof value})`);
    });

    ApphudSdk.nonRenewingPurchases().then((purchases) => {
      log(
        `nonRenewingPurchases (${purchases.length}) =`,
        JSON.stringify(purchases)
      );
    });

    ApphudSdk.subscription().then((s) => {
      log(
        `subscription (typeof ${typeof s}) =`,
        s === null ? 'null' : JSON.stringify(s)
      );
    });

    ApphudSdk.subscriptions().then((ss) => {
      log(`subscriptions (${ss.length}) =`, JSON.stringify(ss));
    });

    ApphudSdk.products().then((products) => {
      log(`products (${products.length}) =`, JSON.stringify(products));
    });

    // Must be called before start()/startManually() to take effect; calling
    // it mid-session only verifies the bridge method itself doesn't crash.
    ApphudSdk.optOutOfTracking();
    log('optOutOfTracking() sent (fire-and-forget, no-op post-start)');

    ApphudSdk.syncPurchasesInObserverMode().then((success) => {
      log(
        `syncPurchasesInObserverMode = ${success} (typeof ${typeof success})`
      );
    });

    ApphudSdk.restorePurchases().then((result) => {
      log('restorePurchases =', JSON.stringify(result));
    });

    // --- Extra coverage for methods the example never called before ---

    ApphudSdk.rawPlacements().then((raw) => {
      log(`rawPlacements (${raw.length}) =`, JSON.stringify(raw));
    });

    ApphudSdk.placement('__non_existent_placement__').then((placement) => {
      log(
        `placement("__non_existent_placement__") (typeof ${typeof placement}) =`,
        placement === null ? 'null' : JSON.stringify(placement)
      );
    });

    const firstPlacementId = placements[0]?.identifier;
    if (firstPlacementId) {
      ApphudSdk.placement(firstPlacementId, {
        forceRefresh: true,
        preferredTimeout: 21,
        maxAttempts: 4,
      }).then((placement) => {
        log(
          `placement("${firstPlacementId}") (typeof ${typeof placement}) =`,
          placement === null ? 'null' : JSON.stringify(placement)
        );
      });

      ApphudSdk.unloadPaywallScreen({ placementIdentifier: firstPlacementId })
        .then(() => log(`unloadPaywallScreen("${firstPlacementId}") resolved`))
        .catch((error) =>
          log(`unloadPaywallScreen("${firstPlacementId}") rejected:`, error)
        );
    } else {
      log('placement()/unloadPaywallScreen() skipped: no placement loaded yet');
    }

    ApphudSdk.preloadPaywallScreens(placements.map((p) => p.identifier));
    log(`preloadPaywallScreens() sent (${placements.length} identifiers)`);

    ApphudSdk.isCommitmentPlanPreferred({
      productId: 'com.apphud.demo.nonconsumable.premium',
    })
      .then((value) => {
        log(`isCommitmentPlanPreferred = ${value} (typeof ${typeof value})`);
      })
      .catch((error) => log('isCommitmentPlanPreferred rejected:', error));

    ApphudSdk.idfv().then((idfv) => {
      log(`idfv (typeof ${typeof idfv}) =`, idfv === null ? 'null' : idfv);
    });

    // Synthetic values: this only verifies the bridge accepts/rejects
    // gracefully, it is not a real device push token or rule payload.
    ApphudSdk.submitPushNotificationsToken('deadbeef')
      .then((success) =>
        log(
          `submitPushNotificationsToken = ${success} (typeof ${typeof success})`
        )
      )
      .catch((error) => log('submitPushNotificationsToken rejected:', error));

    ApphudSdk.handlePushNotification({ rule_id: '__test_rule_id__' })
      .then((handled) =>
        log(`handlePushNotification = ${handled} (typeof ${typeof handled})`)
      )
      .catch((error) => log('handlePushNotification rejected:', error));

    void submitExamplePushToken();
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
              <Text style={styles.detailsValue}>
                {resolvedTotalDevicesCount}
              </Text>
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
                        placementId: placement.identifier,
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
            onPress={requestDeferredDeeplinkAttribution}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Request Deferred Deeplink Attribution
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Result arrives in the ApphudDeeplinkAttribution event.
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          <View style={styles.separator} />
          <ListItem containerStyle={styles.listItem} onPress={checkRules}>
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Check Rules
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Poll for unread rules and present a screen if available.
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          <View style={styles.separator} />
          <ListItem containerStyle={styles.listItem} onPress={logPendingRule}>
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Log Pending Rule
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Print the currently pending or displayed rule to the console.
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          <View style={styles.separator} />
          <ListItem
            containerStyle={styles.listItem}
            onPress={showPendingRuleScreen}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Show Pending Rule Screen
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Present a previously delayed rule screen, if any.
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          <View style={styles.separator} />
          <ListItem containerStyle={styles.listItem} onPress={submitPushToken}>
            <ListItem.Content>
              <ListItem.Title style={styles.actionTitle}>
                Submit Push Token
              </ListItem.Title>
              <ListItem.Subtitle style={styles.actionSubtitle}>
                Re-submit APNs / FCM token to Apphud for Rules delivery.
              </ListItem.Subtitle>
            </ListItem.Content>
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
            void (async () => {
              await ApphudSdk.logout();
              await clearStoredApiKey();
              navigation.reset({ routes: [{ name: 'Login' }] });
            })();
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
