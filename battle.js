let attacksBox = document.querySelector('.attacks');
let userInterface = document.querySelector(".userInterface");
//////////////////////////////////////////////////////////////////////
// new animation

let battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleImg
});

let draggle
let emby
let queue
let renderedSprites


//animation loop
let battleId;
function initBattle() {
    userInterface.style.display = 'block';
    dialogue.style.display = 'none';
    document.querySelector('#enemyHealth').style.width = '100%';
    document.querySelector('#embyHealth').style.width = '100%';
    attacksBox.replaceChildren();

    draggle = new Monster(monsters.draggle);
    emby = new Monster(monsters.emby);
    emby.attacks.forEach(attack => {
        let button = document.createElement('button');
        button.innerHTML = attack.name;
        attacksBox.append(button);
        renderedSprites = [draggle, emby];
    });
    queue = [];
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {
            let attackToUse = attacks[e.currentTarget.innerHTML];
            emby.attack({
                attack: attackToUse,
                recipient: draggle,
                renderedSprites
            })
            if (draggle.health <= 0) {
                queue.push(() => {
                    draggle.faint();
                });
                queue.push(() => {
                    // return to black screen
                    gsap.to("#overlapDiv", {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleId);
                            //restart the original animate function
                            animate();
                            userInterface.style.display = 'none'
                            gsap.to("#overlapDiv", {
                                opacity: 0
                            });
                            battle.started = false;
                            audio.Map.play()
                        }
                    })
                })
            }
            // dragon or enemy attack
            randomAttack = draggle.attacks[floor(random() * draggle.attacks.length)]
            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                })
    
                if (emby.health <= 0) {
                    queue.push(() => {
                        emby.faint();
                    });
                    queue.push(() => {
                        // return to black screen
                        gsap.to("#overlapDiv", {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleId);
                                //restart the original animate function
                                animate();
                                userInterface.style.display = 'none'
                                gsap.to("#overlapDiv", {
                                    opacity: 0
                                });
                                battle.started = false;
                                audio.Map.play()
                            }
                        })
                    })
                }
            })
        });
    
        button.addEventListener('mouseenter', (e) => {
            let attackToUse = attacks[e.currentTarget.innerHTML];
            document.querySelector(".types").innerHTML = attackToUse.type;
            document.querySelector(".types").style.color = attackToUse.color;
        })
    });
    
    animateBattle();
}
function animateBattle() {
    battleId = requestAnimationFrame(animateBattle);
    // draw new background
    battleBackground.update();

    renderedSprites.forEach((sprite) => {
        sprite.update();
    })

}
//start battle
animate();
// initBattle()
// animateBattle();


dialogue.addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift() // remove the first element
    } else
        e.currentTarget.style.display = 'none';
})
