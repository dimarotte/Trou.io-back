import { Room, Client } from "@colyseus/core";
import { BaseRoomState, Item, Player, RoomEtat, User } from "./schema/Schemas";
import { checkEatPlayer, checkEatItem, checkPlayerOutOfBounds, checkTeleportation } from "./AntiCheat";
import { addItem } from "./InitGame";

export abstract class BaseRoom extends Room<BaseRoomState> {
  nextItemId: number = 0;
  private game_duration: number = 5 * 60 * 1000;

  private eatItem(player: Player, item: Item) {
    // Croissance décroissante : plus le joueur est gros, moins il grandit vite
    const growthFactor = 30 + player.radius / 2;
    player.radius += item.point / growthFactor;
    player.score += item.point;
    this.state.items.delete(item.id);
    this.broadcast("itemConsumed", {
      consumedItemId: item.id,
      consumingPlayerId: player.id,
    });
  }

  private eatplayer(player: Player, otherPlayer: Player) {
    player.radius += otherPlayer.radius * 0.2;
    player.score += otherPlayer.score;
    otherPlayer.isAlive = false;
    this.broadcast("playerEliminated", {
      eliminatedPlayerId: otherPlayer.id,
      eliminatingPlayerId: player.id,
    });
  }

  onCreate(_options: any) {
    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        console.warn("Player doesn't exist");
        return;
      }

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

      if (checkTeleportation(player.x, player.y, x, y)) {
        console.log(`Player ${player.id} tried teleporting to (${x}, ${y}) from (${player.x}, ${player.y})`);
        client.error(400, "Teleportation detected")
        return;
      }

      player.x = x;
      player.y = y;

      if (player.isAlive && this.state.etat == RoomEtat.INGAME) {

        // vérification item mangé
        for (const item of this.state.items.values()) {
          if (checkEatItem(item, player)) {
            this.eatItem(player, item)
            addItem(this.nextItemId.toString(), this);
            this.nextItemId++;
          }
        }

        // vérification player mangé
        for (const otherPlayer of this.state.players.values()) {
          if (otherPlayer.id !== player.id && otherPlayer.isAlive) {
            if (checkEatPlayer(otherPlayer, player)) {
              this.eatplayer(player, otherPlayer);
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

    // Autoriser la reconnexion pendant 2 minutes
    try {
      if (!consented) {
        await this.allowReconnection(client, 60 * 2);
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

  private stopGame(baseroom: BaseRoom) {
    baseroom.state.etat = RoomEtat.ENDED;
    console.log("Game Ended in room:", this.roomId);
  }

  startAutoStopTimer() {
    this.clock.setTimeout(this.stopGame, this.game_duration, this);
    this.state.game_duration = this.game_duration / 1000;
  }
}
