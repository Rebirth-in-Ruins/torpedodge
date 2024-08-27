import { Direction } from './direction';

export default class Coordinates {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(direction: Direction): Coordinates {
        switch(direction)
        {
            case Direction.Up:
                return this.above();
            case Direction.Down:
                return this.below();
            case Direction.Left:
                return this.left();
            case Direction.Right:
                return this.right();
            case Direction.Stay:
                return this;
        }
    }

    above(): Coordinates {
        return new Coordinates(this.x, this.y-1);
    }

    below(): Coordinates {
        return new Coordinates(this.x, this.y+1);
    }

    left(): Coordinates {
        return new Coordinates(this.x-1, this.y);
    }

    right(): Coordinates {
        return new Coordinates(this.x+1, this.y);
    }
}
