import type { FeatureModule } from '../composable/FeatureModule';
import { dashboardModule } from './dashboard';
import { usersModule } from './users';
import { ordersModule } from './orders';
import { platformAdminModule } from './observability';
import { externalSystemsModule, showcaseModule } from './showcase';

export * from './models';
export * from './dashboard';
export * from './users';
export * from './orders';
export * from './observability';
export * from './showcase';

/** Default composition. Apps may add/remove modules when calling createApplication(). */
export const coreModules: FeatureModule[] = [
  dashboardModule,
  showcaseModule,
  usersModule,
  ordersModule,
  externalSystemsModule,
  platformAdminModule,
];
