import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity("influencers")
export class InfluencerEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  channel!: string;

  @Column({ nullable: true })
  userid?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  category1?: string;

  @Column({ nullable: true })
  category2?: string;

  @Column({ nullable: true })
  followers?: number;

  @Column({ nullable: true })
  likes?: number;

  @Column({ nullable: true })
  comments?: number;

  @Column({ nullable: true })
  shares?: number;

  @Column({ nullable: true })
  views?: number;

  @Column({ nullable: true })
  country?: string
}
