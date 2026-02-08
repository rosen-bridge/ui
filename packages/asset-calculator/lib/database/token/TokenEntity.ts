import { Column, Entity, PrimaryColumn } from '@rosen-bridge/extended-typeorm';
import { Network } from '@rosen-ui/types';

@Entity('token_entity')
export class TokenEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  name: string;

  @Column('int')
  decimal: number;

  @Column('int')
  significantDecimal: number;

  @Column('boolean')
  isNative: boolean;

  @Column('varchar')
  chain: Network;

  @Column('varchar')
  ergoSideTokenId: string;

  @Column('boolean')
  isResident: boolean;
}
