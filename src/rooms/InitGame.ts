import { MyRoom } from "./MyRoom";

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

export function StartGame() {
    //initialise position joueur et position cube

}