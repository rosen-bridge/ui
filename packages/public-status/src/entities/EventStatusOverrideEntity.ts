import { Column, Entity, PrimaryGeneratedColumn, Unique } from '@rosen-bridge/extended-typeorm';

import type { EventStatusOverrideSeverity } from '../constants';

@Entity('event_status_override_entity')
@Unique(['eventId', 'eventTriggerId'])
export class EventStatusOverrideEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  eventTriggerId: number;

  @Column('varchar')
  eventId: string;

  @Column('varchar')
  status: string;

  @Column('varchar', { nullable: true })
  reason: string | null;

  @Column('varchar', { nullable: true })
  severity: EventStatusOverrideSeverity | null;
}
