import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from '@rosen-bridge/extended-typeorm';

@Entity('watcher_count_entity')
export class WatcherCountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  network: string;

  @Column({ type: 'int' })
  count: number;
}
