import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import {StartGame} from "./InitGame";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  onCreate(options: any) {

    this.onMessage("startgame", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player === this.state.owner && this.state.items.size === 0) {
        StartGame(this);
      }
    });

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = message.x;
        player.y = message.y;
      }
    });
    

  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const newPlayer = new Player();
    newPlayer.name = options.name || "Guest";
    this.state.players.set(client.sessionId, newPlayer);
    if (this.state.players.size === 1) {
      this.state.owner = newPlayer;
    }
    else if (this.state.players.size === 5) {
      StartGame(this);
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
