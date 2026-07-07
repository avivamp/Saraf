/**
 * src/navigation/navigationRef.ts
 *
 * A singleton NavigationContainerRef that lets non-screen components
 * (e.g. SuccessOverlay rendered in App.tsx) trigger navigation without
 * needing a prop or hook — avoiding circular imports through App.tsx.
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootTabParamList } from '@types';

export const navigationRef = createNavigationContainerRef<RootTabParamList>();
