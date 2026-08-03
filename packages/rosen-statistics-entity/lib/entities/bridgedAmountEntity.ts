import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from '@rosen-bridge/extended-typeorm';

@Unique(['fromChain', 'day', 'month', 'year'])
@Entity('bridged_amount_entity')
export class BridgedAmountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  fromChain: string;

  @Column({ type: 'int' })
  day: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  week: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'int' })
  lastProcessedHeight: number;
}
