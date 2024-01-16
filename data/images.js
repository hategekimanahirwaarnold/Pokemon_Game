////////////////////////////////////////////////////////////////
// image creation

function createImg(source) {
    let img = new Image();
    img.src = source;
    return img;
}

image = createImg("../img/Pellet Town.png");

let fireballImg = createImg("../img/fireball.png");

let playerDownImg = createImg("../img/playerDown.png");

let playerUpImg = createImg("../img/playerUp.png");

let playerLeftImg = createImg("../img/playerLeft.png");

let playerRightImg = createImg("../img/playerRight.png");

let foregroundImg = createImg("../img/foreground.png");

let battleImg = createImg("../images/battleBackground.png");

let embyImg = createImg("../images/embySprite.png");

let draggleImg = createImg("../images/draggleSprite.png");
