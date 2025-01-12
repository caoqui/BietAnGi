import {
  Entity,
  Column,
  Unique,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  Check,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Length } from "class-validator";
import { v4 as uuidv4 } from "uuid"; 
import { User } from "./User";
import { ListDish } from "./ListDish";

@Entity()
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  @Length(1, 50)
  name!: string;

  @Column({ nullable: true })
  @Length(0, 20)
  address!: string;

  @Column({ default: "https://3.imimg.com/data3/LM/MH/MY-20992272/stainless-steel-dish-1000x1000.jpg" })
  @Length(0, 200)
  image!: string;

  @Column({ default: 0 })
  count_eating!: number;

  @ManyToOne(() => ListDish, (list) => list.list_dish, { cascade: true })
  list!: ListDish;

  init(
    id: string,
    name: string,
    address: string,
    image: string,
    count_eating: number,
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.image = image;
    this.count_eating = count_eating;
  }
}