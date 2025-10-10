import { distance } from "./AntiCheat";
import { MyRoom } from "./MyRoom";
import { Item, Player } from "./schema/MyRoomState"
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hasCollisionWithPlayers(x: number, y: number, height: number, width: number, myroom: MyRoom): boolean {
    for (const player of myroom.state.players.values()) {
        if (distance(x, y, player.x, player.y) < player.radius) {
            return true;
        }
        if (distance(x + width, y, player.x, player.y) < player.radius) {
            return true;
        }
        if (distance(x, y + height, player.x, player.y) < player.radius) {
            return true;
        }
        if (distance(x + width, y + height, player.x, player.y) < player.radius) {
            return true;
        }
    }
    return false;
}

function hasCollisionWithItems(x: number, y: number, height: number, width: number, myroom: MyRoom): boolean {
    for (const item of myroom.state.items.values()) {
        if (x === item.x && y === item.y) {
            return true;
        }
        if (x + width === item.x && y === item.y) {
            return true;
        }
        if (x === item.x && y + height === item.y) {
            return true;
        }
        if (x + width === item.x && y + height === item.y) {
            return true;
        }

    }
    return false;
}

function hasOutOfBounds(x: number, y: number, height: number, width: number, myroom: MyRoom): boolean {
    if (x < 0 || y < 0 || x + width > myroom.state.map.max_width || y + height > myroom.state.map.max_height) {
        return true;
    }
    return false;
}

function randompos(myroom: MyRoom, height: number, width: number): { x: number; y: number } {
    let notpossible: boolean;
    let x: number;
    let y: number;

    do {
        x = getRandomInt(0, myroom.state.map.max_width);
        y = getRandomInt(0, myroom.state.map.max_height);
        notpossible = false;

        // Vérifie hors limites
        notpossible = hasOutOfBounds(x, y, height, width, myroom);

        // Vérifie collision avec joueurs
        if (!notpossible) {
            notpossible = hasCollisionWithPlayers(x, y, height, width, myroom);
        }

        // Vérifie collision avec items
        if (!notpossible) {
            notpossible = hasCollisionWithItems(x, y, height, width, myroom);
        }

    } while (notpossible);

    return { x, y };
}


function randomPoint(): number {
    return getRandomInt(5, 20);
}


function deductHeight(point: number): number {
    const height = point - (point * 0.3);
    return height;
}

function deductWidth(point: number): number {
    const width = point - (point * 0.3);
    return width;
}

function randomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addItem(id: string, myroom: MyRoom) { //fonction qui ajoute un item a mapschema -> taille random et position random (grace a randompos())
    const item = new Item();
    item.id = id;
    item.color = randomColor();
    item.point = randomPoint();
    item.height = deductHeight(item.point);
    item.width = deductWidth(item.point);
    const pos = randompos(myroom, item.height, item.width);
    item.x = pos.x;
    item.y = pos.y;
    myroom.state.items.set(id, item);
}

export function startGame(myroom: MyRoom) {
    myroom.lock();
    myroom.state.etat = "playing";
    for (const user of myroom.state.users.values()) {
        const newPlayer = new Player();
        newPlayer.id = user.id;
        newPlayer.name = user.name;
        newPlayer.radius = 10;
        newPlayer.score = 0;
        myroom.state.players.set(user.id, newPlayer);
    }
    const maxcube = 50
    for (let i = 0; i < maxcube; i++) {
        addItem(i.toString(), myroom);
    }
    for (const player of myroom.state.players.values()) {
        const pos = randompos(myroom, player.radius * 2, player.radius * 2); // verifie le carré englobant du joueur
        player.x = pos.x;
        player.y = pos.y;
    }
}