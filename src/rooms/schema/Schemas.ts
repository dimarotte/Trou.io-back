import { Schema, MapSchema, type } from "@colyseus/schema";
import { Delayed } from "colyseus";

export class Item extends Schema {
  @type("string") id: string;
  @type("number") width: number;
  @type("number") height: number;
  @type("number") point: number = 0;
  @type("string") color: string;
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Player extends Schema {
  @type("string") name: string;
  @type("string") id: string;
  @type("number") radius: number;
  @type("number") score: number;
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("boolean") isAlive: boolean = true;
}

export class Map extends Schema {
  @type("number") max_height: number = 1000;
  @type("number") max_width: number = 1000;
}

export class User extends Schema {
  @type("string") id: string;
  @type("string") name: string;
}

export abstract class BaseRoomState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Item }) items = new MapSchema<Item>();
  @type(Map) map = new Map();
  @type("string") etat: string = "waiting"; 
}

export class PrivateRoomState extends BaseRoomState{
   @type(User) owner: User | null = null;
}
export class PublicRoomState extends BaseRoomState{
  @type("number") max_player: number;
  @type("number") time_before_begin: number;
  @type("number") start_timer: number;

}