import { BaseRoom } from './BaseRoom';
import { PublicRoomState, User } from './schema/Schemas';
import { startGame } from './InitGame';
import { Client } from 'colyseus';

export class PublicRoom extends BaseRoom {
    declare state: PublicRoomState;

    onCreate(options: any) {
        this.state = new PublicRoomState();
        super.onCreate(options);
        this.state.max_player = 4;
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
    
        const newUser = new User();
        newUser.id = client.sessionId;
        newUser.name = options.name || "Guest";
    
        this.state.users.set(client.sessionId, newUser);
        if (this.state.users.size >= this.state.max_player) {
            startGame(this);
        }
    }
}