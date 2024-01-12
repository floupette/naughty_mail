import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Users extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firm_name: string;
    @Column()
    first_name: string;
    @Column()
    last_name: string;
    @Column()
    email: string;
    @Column()
    phone_number: string;
    @Column()
    password: string;

    @Column()
    last_received_mail: Date;
    @Column()
    last_picked_up: Date;

    @Column()
    has_mail: boolean;
    @Column()
    is_admin: boolean;
}