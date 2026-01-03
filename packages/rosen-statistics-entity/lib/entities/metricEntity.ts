import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from '@rosen-bridge/extended-typeorm';

@Entity('metric_entity')
export class MetricEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'varchar' })
  value: string;

  @Column({ type: 'int' })
  updatedAt: number;
}
