const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
let dialogue = document.querySelector(".dialogue");
let { max, min, random, floor, sin, cos } = Math

canvas.width = 1024;
canvas.height = 576;

///////////////////////////////////////////////////////////
// instantiation

let background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    velocity: {
        x: 0,
        y: 0
    },
    image: image
})
let foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    velocity: {
        x: 0,
        y: 0
    },
    image: foregroundImg
});

let player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 8,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImg,

    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImg,
        down: playerDownImg,
        left: playerLeftImg,
        right: playerRightImg
    }
})

let keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
let lastKey = '';
let movable = [...boundaries, background, foreground, ...battleZones];

function detectCollision({ rect1, rect2 }) {
    return (
        rect1.position.x + rect1.width >= rect2.position.x && // left collision
        rect1.position.x <= rect2.position.x + rect2.width && //right collision
        rect1.position.y <= rect2.position.y + rect2.height && //bottom collision
        rect1.position.y + rect1.height >= rect2.position.y// top collision
    )
}
let battle = {
    started: false
}
////////////////////////////////////////////////////////////////
//initial animation loop

function animate() {
    let animationId = requestAnimationFrame(animate);
    background.update();
    //draw boundaries
    boundaries.forEach(bound => {
        bound.draw();
    })
    battleZones.forEach(battle => {
        battle.draw();
    })
    //draw a player
    player.update();
    foreground.update();


    let move = true;
    player.moving = false;
    if (battle.started) return;
    // check the battle
    if (keys.w.pressed || keys.a.pressed || keys.d.pressed || keys.s.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            battle = battleZones[i];
            let overlapArea = (min(player.position.x + player.width, battle.position.x + battle.width) -
                max(player.position.x, battle.position.x)) /**calculate the width of the area */
                * (min(player.position.y + player.height, battle.position.y + battle.height) -
                    max(player.position.y, battle.position.y)); /**calculate the height of the area */
            if (detectCollision({ rect1: player, rect2: battle }) &&
                overlapArea > (player.width * player.height) / 2 &&
                random() < 0.01
            ) {
                //handle battle

                //cancel the current animation loop
                cancelAnimationFrame(animationId);
                // change audio
                audio.Map.stop();
                audio.initBattle.play();
                audio.battle.play();

                battle.started = true;
                gsap.to('#overlapDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlapDiv', {
                            opacity: 1,
                            duration: 0.4,
                            //animate battle at the end
                            onComplete() {
                                // start a new animation loop
                                initBattle();
                                // animateBattle();
                                gsap.to('#overlapDiv', {
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            }
                        })
                    }
                });
                break;
            }
        }
    }
    // handle key events
    if (keys.w.pressed && lastKey == 'w') {
        player.moving = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            bound = boundaries[i];
            if (detectCollision({
                rect1: player, rect2: {
                    ...bound, position: {
                        x: bound.position.x,
                        y: bound.position.y + 3
                    }
                }
            })) {
                move = false;
                break;
            }
        }
        if (move)
            movable.forEach(item => {
                item.position.y += 3;
            })
    }
    else if (keys.a.pressed && lastKey == 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            player.moving = true;
            player.image = player.sprites.left;
            bound = boundaries[i];
            if (detectCollision({
                rect1: player, rect2: {
                    ...bound, position: {
                        x: bound.position.x + 3,
                        y: bound.position.y
                    }
                }
            })) {
                move = false;
                break;
            }
        }
        if (move)
            movable.forEach(item => {
                item.position.x += 3;
            })
    } else if (keys.s.pressed && lastKey == 's') {
        for (let i = 0; i < boundaries.length; i++) {
            player.moving = true;
            player.image = player.sprites.down;
            bound = boundaries[i];
            if (detectCollision({
                rect1: player, rect2: {
                    ...bound, position: {
                        x: bound.position.x,
                        y: bound.position.y - 3
                    }
                }
            })) {
                move = false;
                break;
            }
        }
        if (move)
            movable.forEach(item => {
                item.position.y += -3;
            })
    } else if (keys.d.pressed && lastKey == 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            player.moving = true;
            player.image = player.sprites.right;
            bound = boundaries[i];
            if (detectCollision({
                rect1: player, rect2: {
                    ...bound, position: {
                        x: bound.position.x - 3,
                        y: bound.position.y
                    }
                }
            })) {
                move = false;
                break;
            }
        }
        if (move)
            movable.forEach(item => {
                item.position.x += -3;
            })
    }
}


let clicked = false;
addEventListener("keydown", ({ key }) => {
    if (!clicked) {
        audio.Map.play();
        clicked = true
    }
    switch (key) {
        case 'w':
            //go up
            keys.w.pressed = true;
            lastKey = 'w';
            break;

        case 'a':
            //go left
            keys.a.pressed = true;
            lastKey = 'a';
            break;

        case 's':
            //go down
            keys.s.pressed = true;
            lastKey = 's';
            break;

        case 'd':
            //go right
            keys.d.pressed = true;
            lastKey = 'd';
            break;

    }
})

addEventListener("keyup", ({ key }) => {
    switch (key) {
        case 'w':
            //go up
            keys.w.pressed = false;
            break;

        case 'a':
            //go left
            keys.a.pressed = false;
            break;

        case 's':
            //go down
            keys.s.pressed = false;
            break;

        case 'd':
            //go right
            keys.d.pressed = false;
            break;

    }
})
addEventListener('click', () => {
    if (!clicked) {
        audio.Map.play();
        clicked = true
    }
})