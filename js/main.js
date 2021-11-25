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

var gMillisec = 0;
var gSec = 0;
var gMin = 0;
var gGameInterval;

var gIsVictory = false;
var gLives = 1;

window.addEventListener("contextmenu", e => e.preventDefault());

function initGame() {
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
    var StrHtmlSmiley = `<button onclick="initGame()">`;
    var normal = '<img src="img/super-mario.png" style="height:40px">';
    var win = '<img src="img/starman.png" style="height:40px">';
    var lose = '<img src="img/koopa.png" style="height:40px">';
    StrHtmlSmiley += gGame.isOn ? normal : gIsVictory ? win : lose;
    //StrHtmlSmiley += gGame.isOn ? SMILEYNORMAL : gIsVictory ? SMILEYWIN : SMILEYDEAD;
    console.log("gGame.isOn", gGame.isOn);
    console.log("gIsVictory", gIsVictory);
    StrHtmlSmiley += `</button>`
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = StrHtmlSmiley;
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
            }
            gLives--;
            renderLives()
        } else {
            gGame.shownCount++;
            console.log("gGame.shownCount", gGame.shownCount)
            expandsShown(gBoard, elCell, i, j);
        }
        gIsVictory = checkGameOver();
        if (gIsVictory) gGame.isOn = false;
        renderSmiley();


    }

    renderBoard(gBoard);
}

//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
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
    if (gIsVictory) gGame.isOn = false;
    renderSmiley();
    //console.log("checkGameOver()", checkGameOver());
    renderBoard(gBoard);
}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    var allMinesMarked = true;

    for (var i = 0; i < gMines.length; i++) {
        var currMine = gBoard[gMines[i].i][gMines[i].j]
        if (!currMine.isMarked) allMinesMarked = false;
    }
    //console.log("allMinesMarked", allMinesMarked)
    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES) && allMinesMarked) {
        clearInterval(gGameInterval);
        gGame.isOn = false;
        return true;
    } else return false;
}

//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
//NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
//BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
function expandsShown(board, elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.minesAroundCount === 0) {
        for (var idxI = i - 1; idxI <= i + 1; idxI++) {
            if (idxI < 0 || idxI > gBoard.length - 1) continue;
            for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
                if (idxJ < 0 || idxJ > gBoard[idxI].length - 1) continue;
                if (idxI === i && idxJ === j) continue;
                if (!gBoard[idxI][idxJ].isShown) {
                    gBoard[idxI][idxJ].isShown = true;
                    gGame.shownCount++;
                    console.log("gGame.shownCount", gGame.shownCount)
                    expandsShown(gBoard, elCell, idxI, idxJ);
                }
            }
        }
    }
}