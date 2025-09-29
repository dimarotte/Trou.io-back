import { Item, Player } from "./schema/MyRoomState";

function CheckEatPlayer(target: Player, player: Player): boolean {
    if( ((target.x - player.x)**2 + (target.y - player.y)**2)**0.5 + target.radius < player.radius )
        return true;
    else
        return false;
}