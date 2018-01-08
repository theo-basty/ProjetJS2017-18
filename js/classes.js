class Zombie{
    constructor(level, posX, posY){
        this.level = level;
        this.posX = posX;
        this.posY = posY;
        this.animFrame = 0;
        switch (level) {
            case 1:
                this.totalLife = 1;
                break;
            case 2:
                this.totalLife = 2;
                break;
            case 3:
                this.totalLife = 3;
                break;
            case 4:
                this.totalLife = 25;
                break;
            default:
                this.totalLife = 0;
        }
        this.life = this.totalLife;
    }
}