import {
  dataSource,
  EventStatusActor,
} from '@rosen-bridge/public-event-status-logic';

if (!dataSource.isInitialized) {
  await dataSource.initialize();
  await dataSource.runMigrations();
  EventStatusActor.init(dataSource);
}
