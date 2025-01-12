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
import { ListDish } from "./ListDish";

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  @Length(1, 20)
  username!: string;

  @Column({ nullable: true })
  @Length(1, 20)
  password!: string;

  @Column({ nullable: true })
  @Length(0, 20)
  fullname!: string;

  @Column({ default: "https://e7.pngegg.com/pngimages/914/653/png-clipart-silhouette-avatar-business-people-silhouettes-animals-public-relations.png" })
  @Length(0, 200)
  avatar!: string;

  @Column({ nullable: true })
  @Length(0, 200)
  google!: string;

  @OneToMany(() => ListDish, (list) => list.user)
  list_dish!: ListDish[];

  init(
    id: string,
    username: string,
    password: string,
    fullname: string,
    avatar: string,
    google: string,
  ) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.fullname = fullname;
    this.google = google;
    this.avatar = avatar;
  }
}