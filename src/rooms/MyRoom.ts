import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { StartGame } from "./InitGame";
import { CheckEatPlayer, CheckEatItem } from "./AntiCheat";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  onCreate(options: any) {

    this.onMessage("startGame", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player === this.state.owner) {
        StartGame();
      }
    });

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = message.x;
        player.y = message.y;
      }
    });

    this.onMessage("playerEat", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      const target = this.state.players.get(message.targetId);
      if (player && target) {
        if (CheckEatPlayer(target, player)) {
          player.radius += target.radius * 0.2;
          player.score += target.score;
          this.state.players.delete(message.targetId);
        }
      }
    });

    this.onMessage("itemEat", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      const item = this.state.items.get(message.itemId);
      if (player && item) {
        if (CheckEatItem(item, player)) {
          player.radius += item.width * 0.2;
          player.score += 1;
          this.state.items.delete(message.itemId);
        }
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
      StartGame();
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
