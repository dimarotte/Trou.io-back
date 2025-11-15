import { Room, Client } from "@colyseus/core";
import { BaseRoomState, User } from "./schema/Schemas";
import { checkEatPlayer, checkEatItem, checkPlayerOutOfBounds } from "./AntiCheat";
import { addItem } from "./InitGame";

export abstract class BaseRoom extends Room<BaseRoomState> {
  onCreate(_options: any) {
    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        const x = Number(message.x);
        const y = Number(message.y);

        if (Number.isNaN(x) || Number.isNaN(y)) {
          client.error(400, "Invalid coordinates");
          return;
        }

        if (checkPlayerOutOfBounds(x, y, player.radius, this.state.map)) {
          console.log(`Player ${player.id} moved out of bounds to (x: ${message.x}, y: ${message.y}), r: ${player.radius} mapw: ${this.state.map.max_width} maph: ${this.state.map.max_height}`);
          client.error(400, "Movement out of bounds detected");
          return;
        }
        else {
          player.x = x;
          player.y = y;
          for (const item of this.state.items.values()) {
            if (checkEatItem(item, player)) {
              var id=item.id;
              player.radius += .1;
              player.score += item.width;
              this.state.items.delete(item.id);
              this.broadcast("itemConsumed", {
                consumedItemId: item.id,
                consumingPlayerId: player.id,
              });
              addItem(id, this);
            }
          }
          for (const otherPlayer of this.state.players.values()) {
            if (otherPlayer.id !== player.id && otherPlayer.isAlive) {
              if (checkEatPlayer(otherPlayer, player)) {
                player.radius += otherPlayer.radius * 0.2;
                player.score += otherPlayer.score;
                otherPlayer.isAlive = false;
                this.broadcast("playerEliminated", {
                  eliminatedPlayerId: otherPlayer.id,
                  eliminatingPlayerId: player.id,
                });
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
