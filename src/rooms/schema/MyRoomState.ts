import { Schema, MapSchema,type } from "@colyseus/schema";

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
}

export class Map extends Schema {
  @type("number") max_height: number = 1000;
  @type("number") max_width: number = 1000;
}

export class MyRoomState extends Schema {
  @type(Player) owner: Player | null = null;
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Item }) items = new MapSchema<Item>();
  @type(Map) map = new Map();
}
