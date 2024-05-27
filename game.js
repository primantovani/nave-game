var canvas = document.getElementById('minha-tela'); 
var ctx = canvas.getContext('2d');

const fps = 60;
const maximoAsteroides = 10;

let gameConfig = {
    tempoInicial: new Date().getTime(),
    tempoAtual: 0,
    pontuacao: 0,
    pontuacaoTempo: 0,
    jogando: false,
    asteroides: [],
    ultimoMovimento: new Date().getTime(), //penalidade
    tempoParado: 0, //penalidade
    dificuldade: 0,
};

const naveConfig = {
    width: 60,
    height: 60,
    x: 0,
    y: 0,
    velocidade: 0,
    empuxo: 10,
    rotacao: 0,
    img: new Image(),
    imgDecolando: new Image(),
    imgVoando: new Image(),
};

const asteroideConfig = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    velocidade: 5,
    imgAsteroide: new Image(),
};

// configurando caminho imagem
naveConfig.img.src = 'imagens/foguete-parado.png';
naveConfig.imgDecolando.src = 'imagens/foguete-decolando.png';
naveConfig.imgVoando.src = 'imagens/foguete-voando.png';

// posicionando nave no centro em baixo
naveConfig.x = (canvas.width / 2) - (naveConfig.width / 2);
naveConfig.y = (canvas.height - naveConfig.height) - 30;
naveConfig.imgVoando.src = 'imagens/foguete-voando.png'

// configurando caminho imagem - asteroide
asteroideConfig.imgAsteroide.src = 'imagens/asteroide.png';

function gameLoop() {
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
        limparTela();
        renderNave();
        renderAsteroides();
        renderTempo();
        renderPontuacao();
        renderPenalidade(); // Penalidade
        renderDificuldade();

        if (!gameConfig.jogando) {
            if (gameConfig.tempoAtual > 0) {
                renderGameOver();
            } else {
                renderStart();
            }
        }
    }, 1000 / fps);
}

function limparTela() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // antes de fazer o desenho é preciso limpar o canvas
}

function renderStart() {
    ctx.save();
    ctx.font = '40px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = "center";
    ctx.fillText("Começar", canvas.width / 2, canvas.height / 2 - 20);
    canvas.style.cursor = "pointer";
    canvas.style.border = "1px solid #ccc";
    ctx.restore();
}

function renderGameOver() {
    ctx.save();
    ctx.font = '40px Arial';
    ctx.fillStyle = '#F00';
    ctx.textAlign = "center";
    ctx.fillText("FIM DE JOGO", canvas.width / 2, canvas.height / 2 + 100);
    canvas.style.cursor = "pointer";
    canvas.style.border = "1px solid #ccc";
    ctx.restore();
}

function renderNave() {
    ctx.save();
    ctx.translate(naveConfig.x + naveConfig.width / 2, naveConfig.y + naveConfig.height / 2);
    ctx.rotate(naveConfig.rotacao * Math.PI / 180);
    let imgFoguete = naveConfig.img;
    if (naveConfig.empuxo > 20) {
        imgFoguete = naveConfig.imgVoando;
    } else if (naveConfig.velocidade > 0) {
        imgFoguete = naveConfig.imgDecolando;
    }
    ctx.drawImage(imgFoguete, -naveConfig.width / 2, -naveConfig.height / 2, naveConfig.width, naveConfig.height);
    ctx.restore();
}

function renderTempo() {
    if (gameConfig.jogando) {
        gameConfig.tempoAtual = ((new Date().getTime() - gameConfig.tempoInicial) / 1000).toFixed(1);
        gameConfig.dificuldade = Math.ceil((gameConfig.tempoAtual || 1)/10) - 1 ; // a cada 10s +1 de dificuldade
    }
    ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = '#000';
    ctx.fillText(`Tempo: ${gameConfig.tempoAtual}s`, 6, canvas.height - 8);
    ctx.restore();
}

function renderPontuacao() {
    // a cada 5s add 1 de score por tempo
    gameConfig.pontuacaoTempo = Math.floor(gameConfig.tempoAtual / 5);
    ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(`Pontos: ${gameConfig.pontuacao + gameConfig.pontuacaoTempo}`, canvas.width - 100, canvas.height - 8);
    ctx.restore();
}

function renderDificuldade() {
    ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#F00';
    ctx.fillText(`Dificuldade: ${gameConfig.dificuldade}`, canvas.width - 140, 30);
    ctx.restore();
}

function gerarNumeroAleatorio(maximo, minimo=0) {
    // Gera um número aleatório entre 0 e o maximo fornecido
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

function renderAsteroides() {
    if (gameConfig.asteroides.length === 0) {
        for (let i = 0; i < gerarNumeroAleatorio(maximoAsteroides); i += 1) {
            let newX = gerarNumeroAleatorio(canvas.width - asteroideConfig.width);
            let newY = gerarNumeroAleatorio(canvas.height - asteroideConfig.height) - canvas.height;
            let size = gerarNumeroAleatorio(asteroideConfig.width * 2);

            // velocidade aumenta quanto + tempo jogando (dificuldade 1 => 10%)
            const dificuldadeVelocidade = gameConfig.dificuldade / 100;
            const minimoVelocidade = asteroideConfig.velocidade + (asteroideConfig.velocidade * dificuldadeVelocidade);
            let velocidade = Math.ceil(gerarNumeroAleatorio(minimoVelocidade * 1.2, minimoVelocidade));
            if (size < asteroideConfig.width) {
                size = asteroideConfig.width;
            }
            // if (velocidade < asteroideConfig.velocidade) {
            //     velocidade = asteroideConfig.velocidade;
            // }
            gameConfig.asteroides.push({
                x: newX,
                y: newY,
                width: size,
                height: size,
                velocidade,
            });
        }
    }

    // Movendo asteroides
    if (gameConfig.jogando) {
        ctx.save();
        for (let i = 0; i < gameConfig.asteroides.length; i += 1) {
            const asteroide = gameConfig.asteroides[i];

            // Linha para desenhar a imagem do asteroide
            ctx.drawImage(asteroideConfig.imgAsteroide, asteroide.x, asteroide.y, asteroide.width, asteroide.height);

            detectarColisao(asteroide);
            asteroide.y += asteroide.velocidade;
        }
        ctx.restore();
        gameConfig.asteroides = gameConfig.asteroides.filter(asteroide => asteroide.y <= canvas.height);
    }
}

function detectarColisao(asteroide) {
    if (((naveConfig.x + naveConfig.width) > asteroide.x && naveConfig.x < (asteroide.x +
        asteroide.width)) && ((naveConfig.y + naveConfig.height) > asteroide.y && naveConfig.y < (asteroide.y + asteroide.height)
    )) {
        gameConfig.jogando = false;
    }
}

function iniciarJogo() {
    canvas.style.cursor = "default";
    canvas.style.border = "1px solid #ccc";
    gameConfig = {
        tempoInicial: new Date().getTime(),
        tempoAtual: 0,
        pontuacao: 0,
        pontuacaoTempo: 0,
        jogando: true,
        asteroides: [],
        ultimoMovimento: new Date().getTime(), // penalidade
        tempoParado: 0 // penalidade
    };
}

function renderPenalidade() {
    let agora = new Date().getTime();
    let tempoSemMovimento = (agora - gameConfig.ultimoMovimento) / 1000;

    if (tempoSemMovimento > 10) {
        // Subtrai 10 pontos a cada 10 segundos de inatividade
        gameConfig.pontuacao -= 10;
        // Reseta o último movimento para o tempo atual para evitar penalidades contínuas
        gameConfig.ultimoMovimento = agora;
    }
}

window.onmousedown = function () {
    if (!gameConfig.jogando) {
        iniciarJogo();
    }
};

window.onkeydown = function (tecla) {
    if (gameConfig.jogando) {
        gameConfig.ultimoMovimento = new Date().getTime(); // Reseta o tempo de inatividade

        naveConfig.velocidade = 10;
        //acelera a nave gradativamente
        if (naveConfig.empuxo < 100) {
            naveConfig.empuxo += 20;
        }
        if (tecla.keyCode == 38) {
            let newY = naveConfig.y - (naveConfig.velocidade + naveConfig.empuxo);
            if (naveConfig.y > 0) {
                // diminuir y tem o efeito de subida
                if (newY < 0) {
                    naveConfig.y = 0;
                } else {
                    naveConfig.y = newY;
                }
            }
            naveConfig.rotacao = 0;
        }
        if (tecla.keyCode == 40) {
            let newY = naveConfig.y + (naveConfig.velocidade + naveConfig.empuxo);
            if (newY > (canvas.height - naveConfig.height - 30)) {
                naveConfig.y = canvas.height - naveConfig.height - 30;
            } else {
                naveConfig.y = newY; // aumentar y tem o efeito de descer
            }
            naveConfig.rotacao = 180;
        }
        if (tecla.keyCode == 39) {
            let newX = naveConfig.x + (naveConfig.velocidade + naveConfig.empuxo);
            if (newX > (canvas.width - naveConfig.height)) {
                naveConfig.x = canvas.width - naveConfig.height;
            } else {
                naveConfig.x = newX; // aumentar o x tem o efeito de ir para a direita
            }
            naveConfig.rotacao = 90;
        }
        if (tecla.keyCode == 37) {
            let newX = naveConfig.x - (naveConfig.velocidade + naveConfig.empuxo);
            if (newX < 0) {
                naveConfig.x = 0;
            } else {
                naveConfig.x = newX; // diminuir o x tem o efeito de ir para a esquerda
            }
            naveConfig.rotacao = 270;
        }
    } else {
        iniciarJogo();
    }
};

window.onkeyup = function () {
    naveConfig.empuxo = 0;
    naveConfig.velocidade = 0;
};

gameLoop();
