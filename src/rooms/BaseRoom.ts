import { Room, Client } from "@colyseus/core";
import { BaseRoomState, Player, User } from "./schema/Schemas";
import { checkEatPlayer, checkEatItem , checkPlayerOutOfBounds} from "./AntiCheat";

export class BaseRoom extends Room<BaseRoomState> {
  maxClients = 4;
  state = new BaseRoomState();
  onCreate(options: any) {

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        if (checkPlayerOutOfBounds(message.x, message.y, player.radius, this.state.map)) {
          return;
        }
        else {
          player.x = message.x;
          player.y = message.y;
          for (const item of this.state.items.values()) {
            if (checkEatItem(item, player)) {
              player.radius += item.width * 0.2;
              player.score += item.width / 2;
              this.state.items.delete(item.id);
            }
          }
          for (const otherPlayer of this.state.players.values()) {
            if (otherPlayer.id !== player.id && otherPlayer.isAlive) {
              if (checkEatPlayer(otherPlayer, player)) {
                player.radius += otherPlayer.radius * 0.2;
                player.score += otherPlayer.score;
                otherPlayer.isAlive = false;
              }
            }
          }
        }
      }
    });

  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const newUser = new User();
    newUser.id = client.sessionId;
    newUser.name = options.name || "Guest";

    this.state.users.set(client.sessionId, newUser);
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    // Autoriser la reconnexion pendant 60 secondes
    try {
      if (!consented) {
        await this.allowReconnection(client, 60);
        console.log(client.sessionId, "reconnected!");
        return;
      }
    } catch (e) {
      console.log(client.sessionId, "failed to reconnect");
    }

    // Si la reconnexion échoue ou si le client a consenti à partir
    this.state.users.delete(client.sessionId);
    if (this.state.etat === "playing" && this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
