import {
  Entity,
  Column,
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

  @Column({ type: 'float' })
  test: number;

  @Column({ type: 'int' })
  lastProcessedHeight: number;

  @Column({ type: 'int' })
  lastProcessedHeight1: number = 4;

  @Column({ type: 'int' })
  lastProcessedHeight2: number = 5;

  @Column({ type: 'int' })
  lastProcessedHeight3: number = 6;
}
