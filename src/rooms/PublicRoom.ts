import { BaseRoom } from './BaseRoom';
import { PublicRoomState, User } from './schema/Schemas';
import { startGame } from './InitGame';
import { Client, Delayed } from 'colyseus';

export class PublicRoom extends BaseRoom {
    declare state: PublicRoomState;
    private timer: Delayed;
    static readonly time_before_begin: number = 30 * 1000;

    onCreate(options: any) {
        this.state = new PublicRoomState();
        super.onCreate(options);
        this.state.max_player = 4;
        this.timer = this.clock.setTimeout(startGame, PublicRoom.time_before_begin, this);
        this.state.time_before_begin = PublicRoom.time_before_begin / 1000;
        const date = new Date();
        this.state.start_timer = Math.floor(date.getTime() / 1000);
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");

        const newUser = new User();
        newUser.id = client.sessionId;
        newUser.name = options.name || "Guest";

        this.state.users.set(client.sessionId, newUser);

        if (this.state.users.size >= this.state.max_player) {
            this.timer.clear();
            startGame(this);
        }
    }
}