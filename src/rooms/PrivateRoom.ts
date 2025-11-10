import { BaseRoom } from './BaseRoom';
import { PrivateRoomState } from './schema/Schemas';
import { startGame } from './InitGame';

export class PrivateRoom extends BaseRoom {
    onCreate(options: any) {
        super.onCreate(options);
        this.state = new PrivateRoomState();
        this.setPrivate(true);
        this.onMessage("setOwner", (client, message) => {
            const user = this.state.users.get(client.sessionId);
            if (user) {
                (this.state as PrivateRoomState).owner = user;
            }
        });
        
        this.onMessage("startGame", (client, message) => {
            const user = this.state.users.get(client.sessionId);
            if (user === (this.state as PrivateRoomState).owner) {
                startGame(this);
            }
        });
    }
}