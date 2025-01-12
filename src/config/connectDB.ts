import dotenv from "dotenv";
import {
  User,
  Dish,
  ListDish,
  ProjectInformation
} from "../entities";
import { DataSourceOptions } from "typeorm";

dotenv.config({ path: "./.env" });

export const connectionString: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOT_NAME_CLOUD,
  port: Number(process.env.DB_PORT_CLOUD),
  username: process.env.DB_USERNAME_CLOUD,
  password: process.env.DB_PASSWORD_CLOUD,
  database: process.env.DB_NAME_CLOUD,
  url: process.env.DB_URL_CLOUD,
  entities: [
    User,Dish,ListDish,ProjectInformation
  ],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};