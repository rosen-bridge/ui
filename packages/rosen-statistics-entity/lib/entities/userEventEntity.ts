import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Unique(['fromAddress', 'toAddress', 'fromChain', 'toChain'])
@Entity('user_event_entity')
export class UserEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  fromAddress: string;

  @Column({ type: 'varchar' })
  toAddress: string;

  @Column({ type: 'varchar' })
  fromChain: string;

  @Column({ type: 'varchar' })
  toChain: string;

  @Column({ type: 'int' })
  count: number;

  @Column({ type: 'int' })
  lastProcessedHeight: number;
}
