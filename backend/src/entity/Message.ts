import { IsNotEmpty } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Base from "./Base";
import Conversation from "./Conversation";
import User from "./User";

@Entity("messages")
export class Message extends Base {
  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @Column("simple-json")
  recievers: { id: string; read: boolean }[];

  @Column("text")
  @IsNotEmpty({ message: "Username must not be empty!" })
  body: string;

  @ManyToOne(() => Conversation, (c) => c.messages, {
    onDelete: "CASCADE",
  })
  conversation: Conversation;

  @Column({ default: false })
  forwarded: boolean;

  @Column("simple-array")
  starrers: string[];
}
