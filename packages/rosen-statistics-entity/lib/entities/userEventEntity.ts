import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Unique(['fromAddress', 'toAddress'])
@Entity('user_event_entity')
export class UserEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  fromAddress: string;

  @Column({ type: 'varchar' })
  toAddress: string;

  @Column({ type: 'int' })
  count: number;

  @Column({ type: 'int', default: 0 })
  lastProcessedHeight: number;
}
