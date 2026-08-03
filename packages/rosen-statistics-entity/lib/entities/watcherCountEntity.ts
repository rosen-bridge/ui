import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Unique(['network'])
@Entity('watcher_count_entity')
export class WatcherCountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  network: string;

  @Column({ type: 'int' })
  count: number;
}
