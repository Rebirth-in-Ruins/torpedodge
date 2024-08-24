interface Collidable {
    getX(): number;
    getY(): number;
}

export default class CollisionDetection {

    list: Array<Collidable> = [];

    add(target: Collidable) {
        this.list.push(target);
    }

    checkCollision(x: number, y: number): boolean {
        for(let obj of this.list) {
            if(obj.getX() == x && obj.getY() == y) {
                return true;
            }
        }

        return false;
    }

}
