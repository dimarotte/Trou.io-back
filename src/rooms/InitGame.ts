import { distance } from "./AntiCheat";
import { BaseRoom } from "./BaseRoom";
import { Item, Player, RoomEtat } from "./schema/Schemas"


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
    // Détection de collision AABB
    for (const item of baseroom.state.items.values()) {
        // Deux rectangles se chevauchent si leurs projections sur les axes X et Y se chevauchent
        const overlapX = !(x + width < item.x || x > item.x + item.width);
        const overlapY = !(y + height < item.y || y > item.y + item.height);

        if (overlapX && overlapY) {
            return true;
        }
    }
    return false;
}

function randompos(BaseRoom: BaseRoom, height: number, width: number): { x: number; y: number } {
    let notpossible: boolean;
    let x: number;
    let y: number;
    const margin = 5; // Marge de sécurité pour éviter les bords

    do {
        // Génère des positions avec une marge pour éviter les bords
        x = getRandomInt(margin, BaseRoom.state.map.width - width - margin);
        y = getRandomInt(margin, BaseRoom.state.map.height - height - margin);
        notpossible = false;

        // // Vérifie hors limites
        // notpossible = hasOutOfBounds(x, y, height, width, BaseRoom);

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
export function addItem(id: string, BaseRoom: BaseRoom) { //fonction qui ajoute un item a mapschema -> taille random et position random (grace a randompos())
    const random = generateSizeDistribution();
    const item = new Item();
    item.id = id;
    item.color = randomColor();
    item.point = random
    item.height = deductHeight(random);
    item.width = deductWidth(random);
    const pos = randompos(BaseRoom, item.height, item.width);
    item.x = pos.x;
    item.y = pos.y;
    BaseRoom.state.items.set(id, item);
}

export function startGame(baseroom: BaseRoom) {
    baseroom.lock();
    for (const user of baseroom.state.users.values()) {
        const newPlayer = new Player();
        newPlayer.id = user.id;
        newPlayer.name = user.name;
        newPlayer.radius = 15;
        newPlayer.score = 0;
        baseroom.state.players.set(user.id, newPlayer);
    }
    const maxcube = 200;
    for (let i = 0; i < maxcube; i++) {
        addItem(i.toString(), baseroom);
    }
    baseroom.nextItemId = maxcube;
    for (const player of baseroom.state.players.values()) {
        const pos = randompos(baseroom, player.radius * 2, player.radius * 2); // verifie le carré englobant du joueur
        //le point est vérifier pour le coin en haut a gauche on decale donc pour faire correspondre le centre
        pos.x = pos.x - player.radius;
        pos.y = pos.y - player.radius;
        player.x = pos.x;
        player.y = pos.y;
    }
    // Changer l'état de la salle en "playing" après l'initialisation
    baseroom.state.etat = RoomEtat.INGAME;
    baseroom.startAutoStopTimer();
    const date = new Date();
    baseroom.state.game_start_time = Math.floor(date.getTime() / 1000);
}

function generateSizeDistribution(): number {
    // distribution inverse exponentielle : beaucoup de petits cubes, peu de gros
    const min = 4;
    const max = 50;
    const exponent = 5; // Plus l'exposant est grand, plus il y a de petites valeurs
    const size = Math.round(min + (max - min) * Math.pow(Math.random(), exponent));
    return size;
}

