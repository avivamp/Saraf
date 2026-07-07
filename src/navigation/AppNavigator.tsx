/**
 * src/navigation/AppNavigator.tsx
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@navigation/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';

import { CatalogScreen }    from '@screens/CatalogScreen';
import { ItemDetailScreen } from '@screens/ItemDetailScreen';
import { CartScreen }       from '@screens/CartScreen';
import { CheckoutScreen }   from '@screens/CheckoutScreen';
import { ProfileScreen }    from '@screens/ProfileScreen';
import { OrdersScreen }     from '@screens/OrdersScreen';
import { AuthScreen }       from '@screens/AuthScreen';
import { FeedbackScreen }       from '@screens/FeedbackScreen';
import { NotificationsScreen }  from '@screens/NotificationsScreen';
import { LanguageScreen }       from '@screens/LanguageScreen';
import { HelpScreen }           from '@screens/HelpScreen';
import { PolicyScreen }         from '@screens/PolicyScreen';

import type {
  CatalogStackParamList,
  CartStackParamList,
  ProfileStackParamList,
  RootTabParamList,
} from '@types';

// ── Shared options ───────────────────────────────────────────────────────

const STACK_CONTENT = { contentStyle: { backgroundColor: COLORS.background } };

const headerOpts = (title: string) => ({
  headerShown:         true,
  title,
  headerStyle:         { backgroundColor: COLORS.surface } as object,
  headerTintColor:     COLORS.textPrimary,
  headerTitleStyle:    { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.semibold } as object,
  headerShadowVisible: false,
  headerBackTitle:     '',
});

// ── Catalog stack ────────────────────────────────────────────────────────

const CS = createNativeStackNavigator<CatalogStackParamList>();
function CatalogNavigator() {
  return (
    <CS.Navigator screenOptions={STACK_CONTENT}>
      <CS.Screen name="Catalog"    component={CatalogScreen}    options={{ headerShown: false }} />
      <CS.Screen name="ItemDetail" component={ItemDetailScreen} options={({ route }) => headerOpts(route.params.product.name)} />
    </CS.Navigator>
  );
}

// ── Cart stack ───────────────────────────────────────────────────────────

const KS = createNativeStackNavigator<CartStackParamList>();
function CartNavigator() {
  return (
    <KS.Navigator screenOptions={STACK_CONTENT}>
      <KS.Screen name="Cart"     component={CartScreen}     options={headerOpts('My Cart')} />
      <KS.Screen name="Checkout" component={CheckoutScreen} options={headerOpts('Checkout')} />
    </KS.Navigator>
  );
}

// ── Profile stack ────────────────────────────────────────────────────────

const PS = createNativeStackNavigator<ProfileStackParamList>();
function ProfileNavigator() {
  return (
    <PS.Navigator screenOptions={STACK_CONTENT}>
      <PS.Screen name="Profile"       component={ProfileScreen}       options={{ headerShown: false }} />
      <PS.Screen name="Orders"        component={OrdersScreen}        options={headerOpts('My Orders')} />
      <PS.Screen name="Auth"          component={AuthScreen}          options={({ route }) => headerOpts(route.params?.mode === 'signup' ? 'Create Account' : 'Sign In')} />
      <PS.Screen name="Feedback"      component={FeedbackScreen}      options={headerOpts('Feedback')} />
      <PS.Screen name="Notifications" component={NotificationsScreen} options={headerOpts('Notifications')} />
      <PS.Screen name="Language"      component={LanguageScreen}      options={headerOpts('Language & Region')} />
      <PS.Screen name="Help"          component={HelpScreen}          options={headerOpts('Help Center')} />
      <PS.Screen name="Policy"        component={PolicyScreen}        options={({ route }) => headerOpts(
        route.params.policyId === 'return'           ? 'Return Policy'     :
        route.params.policyId === 'privacy'          ? 'Privacy Policy'    :
        'Consumer Rights'
      )} />
    </PS.Navigator>
  );
}

// ── Root tabs ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_META: Record<string, { icon: string; label: string }> = {
  CatalogTab: { icon: '🏪', label: 'Shop' },
  CartTab:    { icon: '🛒', label: 'Cart' },
  ProfileTab: { icon: '👤', label: 'Profile' },
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const { icon, label } = TAB_META[route] ?? { icon: '●', label: '' };
  return (
    <View style={tab.wrap}>
      <Text style={tab.icon}>{icon}</Text>
      <Text style={[tab.label, focused && tab.labelActive]}>{label}</Text>
      {focused && <View style={tab.dot} />}
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: tab.bar,
          tabBarLabel: () => null,
          tabBarIcon:  ({ focused }) => <TabIcon route={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="CatalogTab" component={CatalogNavigator} />
        <Tab.Screen name="CartTab"    component={CartNavigator}    />
        <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const tab = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.surface,
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
    height:          72,
    paddingBottom:   SPACING['1'],
  },
  wrap:       { alignItems: 'center', gap: 3, paddingTop: SPACING['2'] },
  icon:       { fontSize: 20 },
  label:      { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 0.4 },
  labelActive:{ color: COLORS.goldBright, fontWeight: TYPOGRAPHY.weight.semibold },
  dot:        { width: 4, height: 4, borderRadius: RADII.full, backgroundColor: COLORS.gold, marginTop: 2 },
});
