function createBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = ''
        }
    }
    return board;
}

function getRandomInt(min, max) { // Maximum is NOT inclusive
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetTimer() {
    gGame.secsPassed = 0;
    renderTimer();
}

function startTimer() {
    gGame.secsPassed++;
    renderTimer();
}

function renderTimer() {
    var timer = document.querySelector('.time');
    //timer.innerText = (gGame.secsPassed < 100) ? gGame.secsPassed < 10 ? '00' + gGame.secsPassed : '0' + gGame.secsPassed : gGame.secsPassed;
    var strTime = (gGame.secsPassed < 100) ? gGame.secsPassed < 10 ? '00' + gGame.secsPassed : '0' + gGame.secsPassed : gGame.secsPassed;
    timer.innerHTML = `<img src="img/time.png" style="height:30px"> ${strTime}`;
}