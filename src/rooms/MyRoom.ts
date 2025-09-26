import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  // maxClients = 4;
  // state = new MyRoomState();
  
  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId); 
      if (player) {
        player.x += data.x;
        player.y += data.y;
      }
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const newPlayer = new Player();
    newPlayer.name = options.name || "Guest";
    this.state.players.set(client.sessionId, newPlayer);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
