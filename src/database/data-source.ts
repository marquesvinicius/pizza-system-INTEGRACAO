import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [
    path.resolve(__dirname, "..", "models", "*.ts")
  ],
  migrations: [
    path.resolve(__dirname, "migrations", "*.ts")
  ],
});
