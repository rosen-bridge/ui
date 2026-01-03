import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from '@rosen-bridge/extended-typeorm';

@Entity('bridged_amount_entity')
export class BridgedAmountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  fromChain: string;

  @Column({ type: 'varchar' })
  toChain: string;

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
}
