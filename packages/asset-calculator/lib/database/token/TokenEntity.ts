import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('token_entity')
export class TokenEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  name: string;

  @Column('int')
  decimal: number;

  @Column('boolean')
  isNative: boolean;

  @Column('varchar')
  chain: string;
}
