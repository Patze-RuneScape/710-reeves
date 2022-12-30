import "reflect-metadata"
import { DataSource } from "typeorm"
import { Override } from "./entity/Override"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "db.sqlite",
    synchronize: true,
    logging: false,
    entities: [Override],
})
