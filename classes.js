////////////////////////////////////////////////////////////////////////
// classes

let map_collisions = [];
let map_battePlace = [];

for (let i = 0; i < collisions.length; i += 70) {
    map_collisions.push(collisions.slice(i, i + 70));
    map_battePlace.push(battlePlace.slice(i, i + 70));
}

class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
        this.velocity = {
            x: 0,
            y: 0
        }
    }
    draw() {
        c.fillStyle = 'rgb(255, 0, 0, 0)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw();
    }
}

let offset = {
    x: -735,
    y: -650
}

let boundaries = [];
let battleZones = [];

map_collisions.forEach((row, i) => {
    let battleRow = map_battePlace[i];
    row.forEach((item, j) => {
        let battleItem = battleRow[j];
        if (item === 1025)
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            }));

        if (battleItem === 1025)
            battleZones.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            }))
    })
})


class Sprite {
    constructor({
        position,
        image,
        frames = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
    }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, passed: 0 };
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height
        }
        this.image.src = image.src
        this.moving = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation
    }

    draw() {
        c.save();
        c.translate(
            this.position.x + this.width / 2, 
            this.position.y + this.height / 2
        )
        c.rotate(this.rotation);
        
        c.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2
        )
        c.globalAlpha = this.opacity;
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        );
        c.restore();
    }
    update() {
        this.draw();

        if (!this.moving) return;
        if (this.frames.max > 1) {
            this.frames.passed++;
        }

        if (this.frames.passed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;
        }
    }
}

class Monster extends Sprite {
    constructor ({
        position,
        image,
        frames = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position,
            image,
            frames,
            sprites,
            animate,
            rotation
        })
        this.health = 100;
        this.isEnemy = isEnemy;
        this.name = name;
        this.attacks = attacks;
    }
    faint() {
        dialogue.innerHTML = `${this.name} fainted`
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        });
        audio.victory.play();
        audio.battle.stop();
    }

    attack({ attack, recipient, renderedSprites }) {
        dialogue.style.display = 'block';
        dialogue.innerHTML = `${this.name} used ${attack.name}`
        recipient.health -= attack.damage;

        let healthBar = '#enemyHealth'
        if (this.isEnemy) 
            healthBar = '#embyHealth'
        
        switch (attack.name) {
            case 'fireball':
                // play audio of being hit
                audio.initFireball.play();
                let fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImg,
                    frames: {
                        max: 4,
                        hold: 30
                    },
                    animate: true,
                    rotation: 0
                });
                renderedSprites.splice(1, 0, fireball);
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                         // enemy was hit
                         // play audio of being hit
                         audio.fireballHit.play();
                         gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,

                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1);
                    }
                })
                break;
            case 'tackle':
                const tl = gsap.timeline();

                let distanceToMove = 20;
                if (this.isEnemy) {
                    distanceToMove = -20;
                }

                tl.to(this.position, {
                    x: this.position.x - distanceToMove
                }).to(this.position, {
                    x: this.position.x + distanceToMove * 2,
                    duration: 0.1,
                    onComplete: () => {
                        // enemy was hit
                         // play audio of being hit
                         audio.tackleHit.play();
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,

                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
        }
    }
}
