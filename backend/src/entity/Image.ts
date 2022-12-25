import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity("images")
export default class Image extends Base {
  @Column()
  url: string;

  @Column()
  cid: string;
}
