import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import Base from "./Base";
import Image from "./Image";
import { Message } from "./Message";
import User from "./User";

export enum ConversationType {
  SOLO = "SOLO",
  GROUP = "GROUP",
}

@Entity("conversations")
export default class Conversation extends Base {
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, type: "text" })
  description?: string;

  @Column({ default: false })
  legit: boolean;

  @OneToOne(() => Image, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  thumbnail?: Image;

  @Column({
    type: "enum",
    enum: ConversationType,
  })
  type: ConversationType;

  @Column("simple-array")
  admins: string[];

  @ManyToOne(() => User)
  @JoinColumn()
  creator: User;

  @ManyToMany(() => User)
  @JoinTable({ name: "conversation_participant" })
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  unread?: number;
}
