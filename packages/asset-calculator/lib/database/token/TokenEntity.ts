import { Network } from '@rosen-ui/types';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('token_entity')
export class TokenEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  name: string;

  @Column('int')
  decimal: number;

  @Column('int', { nullable: true })
  significantDecimal: number | undefined;

  @Column('boolean')
  isNative: boolean;

  @Column('varchar')
  chain: Network;
}
