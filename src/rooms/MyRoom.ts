import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player, User } from "./schema/MyRoomState";
import { startGame } from "./InitGame";
import { checkEatPlayer, checkEatItem , checkPlayerOutOfBounds} from "./AntiCheat";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  onCreate(options: any) {

    this.onMessage("startGame", (client, message) => {
      const user = this.state.users.get(client.sessionId);
      if (user === this.state.owner) {
        startGame(this);
      }
    });

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        if (checkPlayerOutOfBounds(message.x, message.y, player.radius, this.state.map)) {
          //stop movement if out of bounds
          return;
        }
        else {
          player.x = message.x;
          player.y = message.y;
        }
      }
    });

    this.onMessage("playerEat", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      const target = this.state.players.get(message.targetId);
      if (player && target) {
        if (checkEatPlayer(target, player)) {
          player.radius += target.radius * 0.2;
          player.score += target.score;
          target.isAlive = false;
        }
      }
    });

    this.onMessage("itemEat", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      const item = this.state.items.get(message.itemId);
      if (player && item) {
        if (checkEatItem(item, player)) {
          player.radius += item.width * 0.2;
          player.score += 1;
          this.state.items.delete(message.itemId);
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

    // The first user to join becomes the owner
    if (this.state.users.size === 1) {
      this.state.owner = newUser;
    }
    else if (this.state.users.size === 4) {
      startGame(this);
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.users.delete(client.sessionId);
    if (this.state.etat === "playing" && this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
