import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Unique(['fromChain', 'toChain'])
@Entity('event_count_entity')
export class EventCountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  eventCount: number;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'varchar' })
  fromChain: string;

  @Column({ type: 'varchar' })
  toChain: string;
}
