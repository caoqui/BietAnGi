import {
  Entity,
  Column,
  Unique,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  Check,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Length } from "class-validator";
import { v4 as uuidv4 } from "uuid"; 
import { User } from "./User";
import { Dish } from "./Dish";

@Entity()
export class ListDish {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 1 })
  repeat_time!: number;

  @ManyToOne(() => User, (user) => user.list_dish, { cascade: true })
  user!: User;

  @OneToMany(() => Dish, (dish) => dish.list)
  list_dish!: Dish[];

  init(
    id: string,
    repeat_time: number,
  ) {
    this.id = id;
    this.repeat_time = repeat_time;

  }
}