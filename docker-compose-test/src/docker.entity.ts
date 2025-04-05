import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DockerTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
  })
  aaa: string;

  @Column({
    length: 30,
  })
  bbb: string;
}
