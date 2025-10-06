import { Item, Player } from "./schema/MyRoomState";

export function CheckEatPlayer(target: Player, player: Player): boolean {
    if( (distance(target.x, target.y, player.x, player.y) + target.radius < player.radius) )
        return true;
    else
        return false;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
    return ((x1 - x2)**2 + (y1 - y2)**2)**0.5;
}

export function CheckEatItem(item: Item, player: Player): boolean {
    const upper_left_corner = distance(item.x, item.y, player.x, player.y) < player.radius; 
    const upper_right_corner = distance(item.x + item.width, item.y, player.x, player.y) < player.radius;
    const lower_left_corner = distance(item.x, item.y + item.height, player.x, player.y) < player.radius;
    const lower_right_corner = distance(item.x + item.width, item.y + item.height, player.x, player.y) < player.radius;

    if ( upper_left_corner && upper_right_corner && lower_left_corner && lower_right_corner )
        return true;
    else
        return false;
}