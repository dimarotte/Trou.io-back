import { MyRoom } from "./MyRoom";
import {Item} from "./schema/MyRoomState"
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    // Math.random() génère un float entre 0 (inclus) et 1 (exclus)
    // On multiplie par la plage (max - min + 1) et on ajoute min
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randompos(myroom: MyRoom): { x: number; y: number } {
    let notpossible: boolean;
    let x: number;
    let y: number;

    do {
        x = getRandomInt(0, myroom.state.map.max_width);
        y = getRandomInt(0, myroom.state.map.max_height);
        notpossible = false;

        // Vérifie collision avec joueurs
        for (const player of myroom.state.players.values()) {
            if (player.x === x && player.y === y) {
                notpossible = true;
                break; // inutile de continuer si collision détectée
            }
        }

        // Vérifie collision avec items
        if (!notpossible) {
            for (const item of myroom.state.items.values()) {
                if (item.x === x && item.y === y) {
                    notpossible = true;
                    break;
                }
            }
        }
    } while (notpossible);

    return { x, y };
}

function addItem(id : string,myroom: MyRoom) { //fonction qui ajoute un item a mapschema -> taille random et position random (grace a randompos())
    const item = new Item();
    item.color="#FF0000";
    item.point=5;
    item.height=10;
    item.width=10;
    const pos = randompos(myroom);
    item.x=pos.x;
    item.y=pos.y;
    myroom.state.items.set(id,item);
}

export function StartGame(myroom: MyRoom) {
    const maxcube = 100;
    for (const player of myroom.state.players.values()) {
        player.x = 0;
        player.y = 0;
    }
    for (let i = 0; i < maxcube; i++) {
        addItem(i.toString(),myroom);
    }
    for (const player of myroom.state.players.values()) {
        const pos = randompos(myroom);
        player.x = pos.x;
        player.y = pos.y;
    }
}