import { DataSource } from "typeorm";
import Users from "./entities/Users";

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'poule',
    database: 'notimail',
    synchronize: true,
    logging: true,
    entities: [
        Users
    ]
});