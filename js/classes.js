/**
 * Class to represent zombies and do specific action with them
 */
class Zombie{
    /**
     * Conctructor defining fields for the zombie depending on its level
     * @param level
     * the level if the zombie to build
     * @param posX
     * the starting position on X axis of the zombie
     * @param posY
     * the starting position on Y axis of the zombie
     */
    constructor(level, posX, posY){
        this.level = level;
        this.posX = posX;
        this.posY = posY;
        this.animFrame = 0;
        this.moveCycles = 0;
        this.damageFrame = 0;
        switch (level) {
            case 0:
                this.totalLife = 1;
                this.points = 1;
                this.slowness = 1;
                break;
            case 1:
                this.totalLife = 2;
                this.points = 3;
                this.slowness = 5;
                break;
            case 2:
                this.totalLife = 3;
                this.points = 5;
                this.slowness = 3;
                break;
            case 3:
                this.totalLife = 25;
                this.points = 30;
                this.slowness = 7;
                break;
            default:
                this.totalLife = 0;
                this.points = 0;
                this.slowness = 0;
        }
        this.life = this.totalLife;
    }

    /**
     * Method used to draw the zombie on the canvax
     * @param context
     * the context on which the zombie must be drawn
     * @param spritesheet
     * the spritesheet containing the zombies sprites
     */
    drawOnCtx(context, spritesheet){
        //drawing the frame corresponding to the zombie and to its state
        context.drawImage(spritesheet,
            32*(this.level*2+this.damageFrame),          //sprite X
            32*(this.animFrame),         //sprite Y
            32,         //sprite width
            32,         //sprite height
            this.posX,  //display X
            this.posY,  //display Y
            64,         //display width
            64          //display height
        );
        //drawing the zombie's life bar
        if(this.life === this.totalLife) {
            context.fillStyle = "#29c000";
        } else if(this.life > this.totalLife / 2){
            context.fillStyle = "#ffcc00";
        } else {
            context.fillStyle = "#ff0000";
        }
        context.fillRect(this.posX, this.posY, 64*this.life/this.totalLife, 5);
        context.strokeRect(this.posX, this.posY, 64, 5);
    }

    /**
     * Function to check if the cursor is in the hitbox of the zombie
     * @param cvMouseX
     * mouse X position relative to the canvas
     * @param cvMouseY
     * mous Y position relative to the canvas
     * @returns {boolean}
     */
    isHit(cvMouseX, cvMouseY){
        //converting mouse coordinates relative to the zombie sprite position
        let zbMouseX = cvMouseX - this.posX;
        let zbMouseY = cvMouseY - this.posY;

        //checking the hitbox depending on the zombie's level
        switch(this.level){
            case 0:
                return zbMouseX > 18 && zbMouseX <= 44 && zbMouseY >= 24 && zbMouseY <= 60;
            case 1:
                return zbMouseX > 16 && zbMouseX <= 48 && zbMouseY >= 22 && zbMouseY <= 58;
            case 2:
                return zbMouseX > 4 && zbMouseX <= 60 && zbMouseY >= 10 && zbMouseY <= 58;
            case 3:
                return zbMouseX > 8 && zbMouseX <= 54 && zbMouseY >= 4 && zbMouseY <= 58;
        }
    }
}

/**
 * Class representing graves
 */
class Grave{
    /**
     * constructor initing fields of the grave
     * @param posX
     * X position of the grave
     * @param posY
     * Y position of the grave
     * @param zombie
     * The zombie which will be spawned after the animation of this grave
     * @param type
     * The type of grave to draw
     */
    constructor(posX, posY, zombie, type){
        this.posX = posX;
        this.posY = posY;
        this.type = type;
        this.visibleHeight = 0;
        this.shift = false;
        this.opacity = 1;
        this.ttl = 25;
        this.zombie = zombie;
    }

    /**
     * Drawing the grave on the desired canvas
     * @param context
     * The context of the canvas in which to draw the grave
     * @param spritesheet
     * The spritesheet conatining Graves sprites
     */
    drawOnCtx(context, spritesheet){
        //drawing the grave depending on its state
        context.globalAlpha = this.opacity;
        context.drawImage(spritesheet,
            32*(this.type%2),          //sprite X
            32*(Math.floor(this.type/2)),         //sprite Y
            32,         //sprite width
            this.visibleHeight,         //sprite height
            this.posX + 4*this.shift,  //display X
            this.posY + (32-this.visibleHeight)*2,  //display Y
            64,         //display width
            this.visibleHeight*2          //display height
        );
        context.globalAlpha = 1;
    }
}