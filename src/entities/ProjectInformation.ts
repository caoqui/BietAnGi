import {
  Entity,
  Column,
  PrimaryColumn,
} from "typeorm";
import { Length } from "class-validator";

@Entity()
export class ProjectInformation {
  @PrimaryColumn({default: "Biết Ăn Gì"})
  name!: string;

  @Column()
  description!: string;

  @Column({default: "Cao Quí"})
  admin_name!: string;

  @Column({ default: "https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/Anh-avatar-hoat-hinh-de-thuong-xinh-xan.jpg?1704788263223" })
  @Length(0, 200)
  avartar!: string;

  init(
    name: string,
    description: string,
    admin_name: string,
    avartar: string,
  ) {
    this.name = name;
    this.description = description;
    this.admin_name = admin_name;
    this.avartar = avartar;

  }
}