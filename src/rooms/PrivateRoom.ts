import { BaseRoom } from './BaseRoom';
import { PrivateRoomState } from './schema/Schemas';
import { startGame } from './InitGame';
import { Client } from 'colyseus';

export class PrivateRoom extends BaseRoom {
    declare state: PrivateRoomState;

    onCreate(options: any) {
        this.state = new PrivateRoomState();
        super.onCreate(options);
        this.setPrivate(true);

        this.onMessage("startGame", (client, _message) => {
            const user = this.state.users.get(client.sessionId);
            if (user === this.state.owner) {
                console.log(`Owner ${user.name}(${user.id}) started the game`);
                startGame(this);
            } else {
                console.log(`Unauthorized startGame attempt by ${user?.name}(${user?.id})`);
                client.error(403, "Unauthorized");
            }
        });
    }

    onJoin(client: Client, options: any) {
        super.onJoin(client, options);

        // Le premier joueur qui rejoint devient l'owner
        if (!this.state.owner) {
            const user = this.state.users.get(client.sessionId);
            if (user) {
                this.state.owner = user;
                console.log(`${user.name}(${user.id}) is now the owner of the room`);
            }
        }
    }
}