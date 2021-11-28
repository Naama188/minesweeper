'use strict'

const MINE = '💣';
const FLAG = '🚩';
const SMILEYNORMAL = '😃';
const SMILEYDEAD = '😢';
const SMILEYWIN = '😎'

var gBoard = [];
var gMines = [];

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gGameInterval;
var gIsVictory = false;
var gLives = 1;
var gBestScoreLevel = 'bestScore' + gLevel.SIZE;
var gAudio = new Audio("audio/win.wav"); //for gAudio pause on initGame();

window.addEventListener("contextmenu", e => e.preventDefault());

function initGame() {
    gAudio.pause();
    clearInterval(gGameInterval);
    switch (gLevel.SIZE) {
        case 4:
            gLives = 1;
            break;
        case 8:
            gLives = 2;
            break;
        case 12:
            gLives = 3;
            break;
        default:
    }
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.isOn = true;
    gBoard = buildBoard();
    resetTimer();
    renderGame();
}

function renderGame() {
    renderButtons();
    renderBoard(gBoard);
    renderLives()
    renderSmiley();
    renderMarked();
    renderBestScore();
}

function chooseLevel(level) {

    clearInterval(gGameInterval);
    resetTimer();
    switch (level.innerText) {
        case "Beginner":
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            gLives = 1;
            break;
        case "Medium":
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gLives = 2;
            break;
        case "Expert":
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gLives = 3;
            break;
        default:
    }
    gBestScoreLevel = 'bestScore' + gLevel.SIZE;
    initGame();
}

function buildBoard() {
    var board = createBoard(gLevel.SIZE);

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function placeMines(board, idxI, idxJ) {
    gMines = [];
    var mineCount = 0;
    while (mineCount < gLevel.MINES) {
        var i = getRandomInt(0, gLevel.SIZE);
        var j = getRandomInt(0, gLevel.SIZE);
        if (!board[i][j].isMine && (i !== idxI && j !== idxJ)) {
            board[i][j].isMine = true;
            gMines.push({ i: i, j: j })
            mineCount++;
        }
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = setMinesNegsCount(i, j, board)
            }
        }
    }


    return board;
}

function setMinesNegsCount(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function renderSmiley() {
    var strHtmlSmiley = `<button onclick="initGame()">`;
    var normal = '<img src="img/super-mario.png" style="height:40px">';
    var win = '<img src="img/starman.png" style="height:40px">';
    var lose = '<img src="img/koopa.png" style="height:40px">';
    strHtmlSmiley += gGame.isOn ? normal : gIsVictory ? win : lose;
    //StrHtmlSmiley += gGame.isOn ? SMILEYNORMAL : gIsVictory ? SMILEYWIN : SMILEYDEAD;
    console.log("gGame.isOn", gGame.isOn);
    console.log("gIsVictory", gIsVictory);
    strHtmlSmiley += `</button>`
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = strHtmlSmiley;
}


function renderButtons() {
    var strHtmlButtons = `<button onclick="chooseLevel(this)" class="b1">Beginner</button>` + `<button onclick="chooseLevel(this)" class="b2">Medium</button>` + `<button onclick="chooseLevel(this)" class="b3">Expert</button>`;
    var elButtons = document.querySelector('.buttons');
    elButtons.innerHTML = strHtmlButtons;
}

function renderMarked() {
    var markedLeft = gLevel.MINES - gGame.markedCount;
    var strHtmlMarked = `<img src="img/flag.png" style="height:30px"> ${markedLeft}`;
    var elLife = document.querySelector('.marked');
    elLife.innerHTML = strHtmlMarked;

}

function renderLives() {
    //var strHtmlLives = `Lives: ${gLives}`;
    var mushrooms = genMushrooms();
    console.log("mushrooms", mushrooms)
    var strHtmlLives = `Lives: ${mushrooms}`;
    var elLife = document.querySelector('.life');
    elLife.innerHTML = strHtmlLives;

}

function genMushrooms() {
    var mushroomHTML = '<img src="img/mushroom.png" style="width:30px">';
    var strMush = '';
    for (var i = 0; i < gLives; i++) {
        strMush += mushroomHTML;
    }
    return strMush;
}

function renderBoard(board) {
    var strHTML = '<table>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var className = `cell cell-${i}-${j}`;
            className += cell.isShown ? ' shown' : ' hidden';
            strHTML += '<td class = "' + className + '"' + ' onclick="cellClicked(this,' + i + ',' + j + ')" oncontextmenu="cellMarked(this,' + i + ',' + j + ')">';

            if (!cell.isShown) {
                if (cell.isMarked) {
                    strHTML += FLAG;
                } else strHTML += '';
            } else if (cell.isMine) {
                strHTML += MINE;
            } else strHTML += cell.minesAroundCount;

            strHTML += '</td>';
        }
    }
    strHTML += '</tr></table>';
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML;

    // Creating a mat that shows the board content to help with debugging
    var boardValues = [];
    for (var i = 0; i < board.length; i++) {
        boardValues[i] = [];
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                boardValues[i][j] = '*';
            } else boardValues[i][j] = board[i][j].minesAroundCount;
        }

    }
    console.table(boardValues);

}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (!gGame.isOn) return;
    if (gGame.shownCount === 0) {
        placeMines(gBoard, i, j);
        gGameInterval = setInterval(() => {
            startTimer()
        }, 1000);
    }
    if (!cell.isMarked) {
        cell.isShown = true;
        if (cell.isMine) {
            if (gLives === 1) {
                for (var i = 0; i < gMines.length; i++) {
                    var currMine = gBoard[gMines[i].i][gMines[i].j];
                    currMine.isShown = true;
                }
                clearInterval(gGameInterval);
                gGame.isOn = false;
                gIsVictory = false;
                gAudio = new Audio("audio/lose.wav");
                gAudio.play();
            }
            gLives--;
            renderLives()
        } else {
            gGame.shownCount++;
            console.log("gGame.shownCount", gGame.shownCount)
            expandsShown(i, j);
        }
        gIsVictory = checkGameOver();
        renderSmiley();
    }
    renderBoard(gBoard);
}

//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown == false) {
        if (!gBoard[i][j].isMarked) {
            if (gGame.markedCount < gLevel.MINES) {
                gBoard[i][j].isMarked = true;
                gGame.markedCount++;
                renderMarked();
            }
        } else {
            gBoard[i][j].isMarked = false;
            gGame.markedCount--;
            renderMarked();
        }
    }
    console.log("gGame.markedCount", gGame.markedCount);
    gIsVictory = checkGameOver();
    renderSmiley();
    renderBoard(gBoard);
}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    var allMinesMarked;
    var markedMines = 0;
    var shownMines = 0;
    for (var i = 0; i < gMines.length; i++) {
        var currMine = gBoard[gMines[i].i][gMines[i].j]
        if (currMine.isMarked) markedMines++;
        if (currMine.isShown) shownMines++;
    }
    if (markedMines + shownMines === gLevel.MINES) allMinesMarked = true;
    else allMinesMarked = false;
    //console.log("allMinesMarked", allMinesMarked)
    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES) && allMinesMarked) {
        clearInterval(gGameInterval);
        checkBestScore();
        renderBestScore();
        gGame.isOn = false;
        gAudio = new Audio("audio/win.wav");
        gAudio.play();
        return true;
    } else return false;
}

function checkBestScore() {
    gBestScoreLevel = 'bestScore' + gLevel.SIZE;
    console.log(gBestScoreLevel)
    if (localStorage.getItem(gBestScoreLevel) === null) {
        localStorage.setItem(gBestScoreLevel, gGame.secsPassed);
    } else if (localStorage.getItem(gBestScoreLevel) > gGame.secsPassed) {
        localStorage.setItem(gBestScoreLevel, gGame.secsPassed);
    }
}

function renderBestScore() {
    var bestScore = localStorage.getItem(gBestScoreLevel);
    if (bestScore !== null) {
        var strHtmlBestScore = `Best Score: ${bestScore} seconds`;
    } else {
        strHtmlBestScore = `Best Score: Not Set Yet`
    }
    var elBestScore = document.querySelector('.bestScore');
    elBestScore.innerHTML = strHtmlBestScore;
}

//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
//NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
//BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
function expandsShown(i, j) {
    var cell = gBoard[i][j];
    if (cell.minesAroundCount === 0) {
        for (var idxI = i - 1; idxI <= i + 1; idxI++) {
            if (idxI < 0 || idxI > gBoard.length - 1) continue;
            for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
                if (idxJ < 0 || idxJ > gBoard[idxI].length - 1) continue;
                if (idxI === i && idxJ === j) continue;
                if (!gBoard[idxI][idxJ].isShown && !gBoard[idxI][idxJ].isMarked) {
                    gBoard[idxI][idxJ].isShown = true;
                    gGame.shownCount++;
                    console.log("gGame.shownCount", gGame.shownCount)
                    expandsShown(idxI, idxJ);
                }
            }
        }
    }
}