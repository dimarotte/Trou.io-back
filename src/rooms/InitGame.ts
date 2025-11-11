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
    const height = 2 * point - (point * 0.3);
    return height;
}

function deductWidth(point: number): number {
    const width = 2 * point - (point * 0.3);
    return width;
}

const PALETTES = [
    ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2'], // pop
    ['#A3D5FF', '#FFB3C1', '#B9FBC0', '#FDE2E4', '#C6DEF1'], // pastel
    ['#F7A072', '#A9DEF9', '#E4C1F9', '#F9F7A1', '#B5EAD7'], // doux
];

function randomColor(): string {
    const index = getRandomInt(0, PALETTES.length - 1);
    return PALETTES[index][getRandomInt(0, PALETTES[index].length - 1)];
}
function addItem(id: string, BaseRoom: BaseRoom) { //fonction qui ajoute un item a mapschema -> taille random et position random (grace a randompos())
    const item = new Item();
    item.id = id;
    item.color = randomColor();
    item.point = generateSizeDistribution();
    item.height = deductHeight(item.point);
    item.width = deductWidth(item.point);
    const pos = randompos(BaseRoom, item.height, item.width);
    item.x = pos.x;
    item.y = pos.y;
    BaseRoom.state.items.set(id, item);
}

export function startGame(baseroom: BaseRoom) {
    baseroom.lock();
    baseroom.state.etat = "playing";
    for (const user of baseroom.state.users.values()) {
        const newPlayer = new Player();
        newPlayer.id = user.id;
        newPlayer.name = user.name;
        newPlayer.radius = 20;
        newPlayer.score = 0;
        baseroom.state.players.set(user.id, newPlayer);
    }
    const maxcube = 200;
    for (let i = 0; i < maxcube; i++) {
        addItem(i.toString(), baseroom);
    }
    for (const player of baseroom.state.players.values()) {
        const pos = randompos(baseroom, player.radius * 2, player.radius * 2); // verifie le carré englobant du joueur
        player.x = pos.x;
        player.y = pos.y;
    }
}

function generateSizeDistribution(): number {
    // distribution des tailles des items
    // exponentielle de moyenne 10
    const lambda = 1 / 10; // plus la lambda est grande, plus les valeurs sont petites
    const u = Math.random();
    const size = Math.round(-Math.log(1 - u) / lambda);
    if (size < 5) return 5;
    if (size > 500) return 20;
    return size;
}

