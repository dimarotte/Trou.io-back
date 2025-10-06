import { Schema, MapSchema, type } from "@colyseus/schema";

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

export class MyRoomState extends Schema {
  @type(User) owner: User | null = null;
  @type({ map: User }) users = new MapSchema<User>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Item }) items = new MapSchema<Item>();
  @type(Map) map = new Map();
  @type(String) etat : String = "waiting"; 
}
