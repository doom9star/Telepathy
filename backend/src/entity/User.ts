import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty, Length } from "class-validator";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import Base from "./Base";
import Image from "./Image";

@Entity("users")
export default class User extends Base {
  @Column()
  @IsNotEmpty({ message: "Username must not be empty!" })
  username: string;

  @Exclude()
  @Column()
  @Length(8, undefined, { message: "Password length must be >= 8!" })
  password: string;

  @Column({ unique: true })
  @IsEmail(undefined, { message: "Email must be an email!" })
  email: string;

  @Column({ nullable: true })
  bio: string;

  @Exclude()
  @Column({ default: false })
  activated: boolean;

  @OneToOne(() => Image, { cascade: true })
  @JoinColumn()
  avatar: Image;

  @Column({ default: true })
  restricted: boolean;
}
