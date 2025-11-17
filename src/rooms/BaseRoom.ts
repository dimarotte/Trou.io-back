import { Room, Client } from "@colyseus/core";
import { BaseRoomState, RoomEtat, User } from "./schema/Schemas";
import { checkEatPlayer, checkEatItem, checkPlayerOutOfBounds,checkTeleportation } from "./AntiCheat";
import { addItem } from "./InitGame";

export abstract class BaseRoom extends Room<BaseRoomState> {
  nextItemId: number = 0;
  private auto_stop_timer: number = 5 * 60 * 1000;

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
          console.log(`Player ${player.id} moved out of bounds to (x: ${x}, y: ${y}), r: ${player.radius} mapw: ${this.state.map.width} maph: ${this.state.map.height}`);
          client.error(400, "Movement out of bounds detected");
          return;
        }
        else {
          if (checkTeleportation(player.x,player.y,x,y)){
            console.log(`Player ${player.id} tried teleporting to (${x}, ${y}) from (${player.x}, ${player.y})`);
            client.error(400,"Teleportation detected")
            return;
          }
          player.x=x;
          player.y=y;
          for (const item of this.state.items.values()) {
            if (checkEatItem(item, player)) {
              player.radius += .1;
              player.score += item.width;
              this.state.items.delete(item.id);
              this.broadcast("itemConsumed", {
                consumedItemId: item.id,
                consumingPlayerId: player.id,
              });
              addItem(this.nextItemId.toString(), this);
              this.nextItemId++;
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
    if (this.state.etat === RoomEtat.INGAME && this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.state.items.clear();
    this.state.players.clear();
  }

  private stopGame() {
    this.state.etat = RoomEtat.ENDED;
    console.log("Game Ended in room:", this.roomId);
  }

  startAutoStopTimer() {
    this.clock.setTimeout(this.stopGame, this.auto_stop_timer, this);
    this.state.auto_stop_time = this.auto_stop_timer / 1000;
  }
}
