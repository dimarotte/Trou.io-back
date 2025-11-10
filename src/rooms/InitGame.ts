import { distance } from "./AntiCheat";
import { BaseRoom } from "./BaseRoom";
import { Item, Player } from "./schema/Schemas"
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hasCollisionWithPlayers(x: number, y: number, height: number, width: number, baseroom: BaseRoom): boolean {
    for (const player of baseroom.state.players.values()) {
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

function hasCollisionWithItems(x: number, y: number, height: number, width: number, baseroom: BaseRoom): boolean {
    for (const item of baseroom.state.items.values()) {
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

function hasOutOfBounds(x: number, y: number, height: number, width: number, baseroom: BaseRoom): boolean {
    if (x < 1 || y < 1 || x + width > baseroom.state.map.max_width || y + height > baseroom.state.map.max_height) {
        return true;
    }
    return false;
}

function randompos(BaseRoom: BaseRoom, height: number, width: number): { x: number; y: number } {
    let notpossible: boolean;
    let x: number;
    let y: number;

    do {
        x = getRandomInt(0, BaseRoom.state.map.max_width);
        y = getRandomInt(0, BaseRoom.state.map.max_height);
        notpossible = false;

        // Vérifie hors limites
        notpossible = hasOutOfBounds(x, y, height, width, BaseRoom);

        // Vérifie collision avec joueurs
        if (!notpossible) {
            notpossible = hasCollisionWithPlayers(x, y, height, width, BaseRoom);
        }

        // Vérifie collision avec items
        if (!notpossible) {
            notpossible = hasCollisionWithItems(x, y, height, width, BaseRoom);
        }

    } while (notpossible);

    return { x, y };
}


function randomPoint(): number {
    return getRandomInt(5, 20);
}


function deductHeight(point: number): number {
    const height = 2*point - (point * 0.3);
    return height;
}

function deductWidth(point: number): number {
    const width = 2*point - (point * 0.3);
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

function addItem(id: string, BaseRoom: BaseRoom) { //fonction qui ajoute un item a mapschema -> taille random et position random (grace a randompos())
    const item = new Item();
    item.id = id;
    item.color = randomColor();
    item.point = randomPoint();
    item.height = deductHeight(item.point);
    item.width = deductWidth(item.point);
    const pos = randompos(BaseRoom, item.height, item.width);
    item.x = pos.x;
    item.y = pos.y;
    BaseRoom.state.items.set(id, item);
}

export function startGame(baseroom : BaseRoom) {
    baseroom.lock();
    baseroom.state.etat = "playing";
    for (const user of baseroom.state.users.values()) {
        const newPlayer = new Player();
        newPlayer.id = user.id;
        newPlayer.name = user.name;
        newPlayer.radius = 10;
        newPlayer.score = 0;
        baseroom.state.players.set(user.id, newPlayer);
    }
    const maxcube = 50;
    for (let i = 0; i < maxcube; i++) {
        addItem(i.toString(), baseroom);
    }
    for (const player of baseroom.state.players.values()) {
        const pos = randompos(baseroom, player.radius * 2, player.radius * 2); // verifie le carré englobant du joueur
        player.x = pos.x;
        player.y = pos.y;
    }
}