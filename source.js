var pieces = [];
var table = document.getElementById("board");
var turn = "white";
var selectedPiece;
var isInCheck = false;
var checkmate = false;
var animationLength = 300;
var AIparams = ["black", 1];

var pieceValues = {
    "pawn": 10,
    "knight": 30,
    "bishop": 30,
    "rook": 50,
    "queen": 90,
    "king": 30,

}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function evaluateGameScore(team) {
    var score = 0;
    for (var piece of pieces) {
        if (piece.team == team) {
            score += pieceValues[piece.type]
        } else {
            score -= pieceValues[piece.type]
        }
    }
    if (checkForCheckmate(enemy(team), false)) {
        score += 70;
    }
    if (checkForCheckmate(team, false)) {
        score -= 70;
    }
    return score;
}

var letters = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E",
    5: "F",
    6: "G",
    7: "H",
}

function coordsToNotation([r, c]) {
    return letters[c] + (8 - r)
}


function changeTurns() {
    var indicator = document.getElementById("turnIndicator")
    if (turn === "white") {
        turn = "black";
        indicator.innerHTML = "Black's turn";

    } else {
        turn = "white"
        indicator.innerHTML = "White's turn";
    }
}

function attempAIMove() {
    if (!checkmate && blackAI !== undefined && blackAI.team == turn) {
        blackAI.hardMove()
    }
    if (!checkmate && whiteAI !== undefined && whiteAI.team == turn) {
        whiteAI.hardMove()
    }
}


function enemy(turn) {
    if (turn === "white") {
        return "black";
    } else {
        return "white"
    }
}


function getCellAt(r, c) {
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        var cell = table.rows[r].cells[c]
        if (cell.tagName == "TD") {
            return cell;
        }
    }
    return undefined;
}

function getCoordinates(td) {
    var row;
    for (var i = 0; i < 8; i++) {
        row = table.rows[i]
        if (row === td.parentNode) {
            for (var j = 0; j < 8; j++) {
                if (row.cells[j] === td) {
                    return [i, j];
                }
            }
        }
    }
}


function getPieceAt(r, c) {
    try {
        for (var piece of pieces) {
            if (piece.row == r && piece.col == c) {
                return piece;
            }
        }
    } catch (err) {
        return;
    }
}


function select(td) {
    var coords = getCoordinates(td)
    if ((coords[0] * 7 + coords[1]) % 2 == 0) {
        td.style.backgroundImage = "url(Assets/selectedLightSquare.png)";
    } else {
        td.style.backgroundImage = "url(Assets/selectedDarkSquare.png)";
    }
    td.firstChild.style.transform = "scale(1.2)"
}


function clearHighlight() {
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var cell = getCellAt(i, j)
            cell.style.backgroundImage = "";
            cell.style.filter = "brightness(100%)"
            try {
                cell.firstChild.style.transform = ""
            } catch (err) { continue; }
        }
    }
}

function clearPieces() {
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var cell = getCellAt(i, j)
            cell.innerHTML = ""
        }
    }
}


function checkForCheck(team) {
    enemyMoves = []
    var king;
    for (var piece of pieces) {
        if (piece.team !== team) { //if piece is enemy
            piece.updateValidMoves()
            for (var move of piece.validSquares) {
                enemyMoves.push(move);
            }
        } else if (piece.type == "king") {
            king = piece;
        }
    }
    if (king == undefined) {
        return true;
    }
    if (enemyMoves.includes(getCellAt(king.row, king.col))) {
        isInCheck = true;
        return true;
    } else {
        isInCheck = false;
        return false;
    }
}


function showCheck() {
    if (isInCheck && !checkmate) {
        document.getElementById("check").innerHTML = "Check!"
    } else if (!checkmate) {
        document.getElementById("check").innerHTML = ""
    }
}


function checkForCheckmate(team, isFinal) {
    if (checkForCheck(team)) {
        for (var piece of pieces) {
            if (piece.team == team) {
                piece.updateValidMoves();
                var prevLoc = [piece.row, piece.col]


                for (var move of piece.validSquares) {
                    var coords = getCoordinates(move)
                    piece.updateValidMoves();
                    if (getPieceAt(coords[0], coords[1]) == undefined) {
                        piece.moveTo(coords[0], coords[1])
                        if (!checkForCheck(team)) {
                            piece.moveTo(prevLoc[0], prevLoc[1])
                            checkForCheck(team)
                            return false;
                        } else {
                            piece.moveTo(prevLoc[0], prevLoc[1])
                        }


                    } else {
                        var enemyPiece = getPieceAt(coords[0], coords[1])
                        piece.moveTo(coords[0], coords[1])
                        var index = pieces.indexOf(enemyPiece)
                        pieces.splice(index, 1);
                        if (!checkForCheck(team)) {
                            piece.moveTo(prevLoc[0], prevLoc[1])
                            pieces.splice(index, 0, enemyPiece);
                            checkForCheck(team)
                            return false;
                        } else {
                            piece.moveTo(prevLoc[0], prevLoc[1])
                            pieces.splice(index, 0, enemyPiece);
                        }
                    }
                }
            }
        }
        if (isFinal) {
            checkmate = true;
            document.getElementById("check").innerHTML = "Checkmate!"
            document.getElementById("board").removeEventListener("click", eventClick)
        }
        return true;
    }
    return false;
}


function newGame() {
    pieces = [];
    table = document.getElementById("board");
    turn = "white";
    selectedPiece;
    isInCheck = false;
    checkmate = false;
}




//shorthand information about pieces to store the game state more easily
var pieceKey = {
    "pawn": "P",
    "rook": "R",
    "knight": "H",
    "bishop": "B",
    "queen": "Q",
    "king": "K",
    undefined: "-",
    "white": "W",
    "black": "B",
}


var prevGameStates = []

function checkForDraw() {
    var currentGameState = ""
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var piece = getPieceAt(i, j)
            if (piece !== undefined) {
                currentGameState = currentGameState.concat(pieceKey[piece.type])
                currentGameState = currentGameState.concat(pieceKey[piece.team])
            } else {
                currentGameState = currentGameState.concat("-")
            }
        }
    }

    var counter = 1;
    for (var state of prevGameStates) {
        if (state == currentGameState) {
            counter += 1
        }
    }

    if (counter >= 3) {
        checkmate = true;
        document.getElementById("check").innerHTML = "Draw! (threefold repetition)"
        document.getElementById("board").removeEventListener("click", eventClick)
    } else {
        prevGameStates.push(currentGameState);
    }

}


class Piece {
    constructor(type, team, row, col) {
        this.type = type;
        this.team = team;
        this.row = row;
        this.col = col;
        this.cell = table.rows[this.row].cells[this.col];
        this.hasMoved = false;
        this.canBePassant = false;


    }


    //displays the piece at the coordinates given
    show() {
        if (this.type == "pawn" && this.team == "white") {
            this.cell.innerHTML = "<img class=\"piece\" src=\"Assets/pawn.png\">";
        }
        if (this.type == "pawn" && this.team == "black") {
            this.cell.innerHTML = "<img class=\"piece\" id=\"black\" src=\"Assets/pawn.png\">";
        }
        if (this.type == "rook" && this.team == "white") {
            this.cell.innerHTML = "<img class=\"piece\" src=\"Assets/rook.png\">";
        }
        if (this.type == "rook" && this.team == "black") {
            this.cell.innerHTML = "<img class=\"piece\" id=\"black\" src=\"Assets/rook.png\">";
        }
        if (this.type == "knight" && this.team == "white") {
            this.cell.innerHTML = "<img class=\"piece\" src=\"Assets/knight.png\">";
        }
        if (this.type == "knight" && this.team == "black") {
            this.cell.innerHTML = "<img class=\"piece\" id=\"black\" src=\"Assets/knight.png\">";
        }
        if (this.type == "bishop" && this.team == "white") {
            this.cell.innerHTML = "<img class=\"piece\" src=\"Assets/bishop.png\">";
        }
        if (this.type == "bishop" && this.team == "black") {
            this.cell.innerHTML = "<img class=\"piece\" id=\"black\" src=\"Assets/bishop.png\">";
        }
        if (this.type == "queen" && this.team == "white") {
            this.cell.innerHTML = "<img class=\"piece\" src=\"Assets/queen.png\">";
        }
        if (this.type == "queen" && this.team == "black") {
            this.cell.innerHTML = "<img class=\"piece\" id=\"black\" src=\"Assets/queen.png\">";
        }
        if (this.type == "king" && this.team == "white") {
            this.cell.innerHTML = "<img class=\"piece\" src=\"Assets/king.png\">";
        }
        if (this.type == "king" && this.team == "black") {
            this.cell.innerHTML = "<img class=\"piece\" id=\"black\" src=\"Assets/king.png\">";
        }
    }

    moveTo(r, c) {
        this.row = r;
        this.col = c;
        this.cell = getCellAt(this.row, this.col);

        if (this.type == "pawn" && this.team == "black" && this.row == 7) {
            this.type = "queen"
        }
        if (this.type == "pawn" && this.team == "white" && this.row == 0) {
            this.type = "queen"
        }
    }

    hardMoveTo(r, c) {
        this.row = r;
        this.col = c;
        this.cell.innerHTML = ""
        this.cell = getCellAt(this.row, this.col);

        if (this.type == "pawn" && this.team == "black" && this.row == 7) {
            this.type = "queen"
        }
        if (this.type == "pawn" && this.team == "white" && this.row == 0) {
            this.type = "queen"
        }

        this.show();
    }


    //defines moves each piece is allowed to make
    updateValidMoves() {
        this.validSquares = [];
        this.castleSquares = [];
        this.enPassantSquares = [];

        //PAWN - forward movement
        if (this.type == "pawn" && this.team == "white") {
            if (getPieceAt(this.row - 1, this.col) == undefined) {
                this.validSquares.push(getCellAt(this.row - 1, this.col))
                if (this.hasMoved == false && getPieceAt(this.row - 2, this.col) == undefined) {
                    this.validSquares.push(getCellAt(this.row - 2, this.col))
                }
            }
            //diagonal capture
            if (getPieceAt(this.row - 1, this.col - 1) !== undefined) {
                this.validSquares.push(getCellAt(this.row - 1, this.col - 1))
            }
            if (getPieceAt(this.row - 1, this.col + 1) !== undefined) {
                this.validSquares.push(getCellAt(this.row - 1, this.col + 1))
            }

            //en passant left
            if (this.row == 3 &&
                getPieceAt(this.row, this.col - 1) !== undefined &&
                getPieceAt(this.row, this.col - 1).canBePassant) {
                this.enPassantSquares.push(getCellAt(this.row - 1, this.col - 1))
            }
            if (this.row == 3 &&
                getPieceAt(this.row, this.col + 1) !== undefined &&
                getPieceAt(this.row, this.col + 1).canBePassant) {
                this.enPassantSquares.push(getCellAt(this.row - 1, this.col + 1))
            }
        }

        if (this.type == "pawn" && this.team == "black") {
            if (getPieceAt(this.row + 1, this.col) == undefined) {
                this.validSquares.push(getCellAt(this.row + 1, this.col))
                if (this.hasMoved == false && getPieceAt(this.row + 2, this.col) == undefined) {
                    this.validSquares.push(getCellAt(this.row + 2, this.col))
                }
            }
            if (getPieceAt(this.row + 1, this.col - 1) !== undefined) {
                this.validSquares.push(getCellAt(this.row + 1, this.col - 1))
            }
            if (getPieceAt(this.row + 1, this.col + 1) !== undefined) {
                this.validSquares.push(getCellAt(this.row + 1, this.col + 1))
            }

            if (this.row == 4 &&
                getPieceAt(this.row, this.col - 1) !== undefined &&
                getPieceAt(this.row, this.col - 1).canBePassant) {
                this.enPassantSquares.push(getCellAt(this.row + 1, this.col - 1))
            }
            if (this.row == 4 &&
                getPieceAt(this.row, this.col + 1) !== undefined &&
                getPieceAt(this.row, this.col + 1).canBePassant) {
                this.enPassantSquares.push(getCellAt(this.row + 1, this.col + 1))
            }
        }

        //ROOK & 1/2 of queen 
        if (this.type == "rook" || this.type == "queen") {
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row + i, this.col) == undefined) {
                    this.validSquares.push(getCellAt(this.row + i, this.col))
                } else {
                    this.validSquares.push(getCellAt(this.row + i, this.col))
                    break;
                }
            }
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row - i, this.col) == undefined) {
                    this.validSquares.push(getCellAt(this.row - i, this.col))
                } else {
                    this.validSquares.push(getCellAt(this.row - i, this.col))
                    break;
                }
            }
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row, this.col + i) == undefined) {
                    this.validSquares.push(getCellAt(this.row, this.col + i))
                } else {
                    this.validSquares.push(getCellAt(this.row, this.col + i))
                    break;
                }
            }
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row, this.col - i) == undefined) {
                    this.validSquares.push(getCellAt(this.row, this.col - i))
                } else {
                    this.validSquares.push(getCellAt(this.row, this.col - i))
                    break;
                }
            }
        }

        //BISHOP & 1/2 of queen
        if (this.type == "bishop" || this.type == "queen") {
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row + i, this.col + i) == undefined) {
                    this.validSquares.push(getCellAt(this.row + i, this.col + i))
                } else {
                    this.validSquares.push(getCellAt(this.row + i, this.col + i))
                    break;
                }
            }
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row - i, this.col - i) == undefined) {
                    this.validSquares.push(getCellAt(this.row - i, this.col - i))
                } else {
                    this.validSquares.push(getCellAt(this.row - i, this.col - i))
                    break;
                }
            }
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row - i, this.col + i) == undefined) {
                    this.validSquares.push(getCellAt(this.row - i, this.col + i))
                } else {
                    this.validSquares.push(getCellAt(this.row - i, this.col + i))
                    break;
                }
            }
            for (var i = 1; i < 8; i++) {
                if (getPieceAt(this.row + i, this.col - i) == undefined) {
                    this.validSquares.push(getCellAt(this.row + i, this.col - i))
                } else {
                    this.validSquares.push(getCellAt(this.row + i, this.col - i))
                    break;
                }
            }
        }

        //KNIGHT
        if (this.type == "knight") {
            this.validSquares.push(getCellAt(this.row + 2, this.col - 1))
            this.validSquares.push(getCellAt(this.row + 2, this.col + 1))
            this.validSquares.push(getCellAt(this.row - 2, this.col - 1))
            this.validSquares.push(getCellAt(this.row - 2, this.col + 1))
            this.validSquares.push(getCellAt(this.row + 1, this.col + 2))
            this.validSquares.push(getCellAt(this.row - 1, this.col + 2))
            this.validSquares.push(getCellAt(this.row + 1, this.col - 2))
            this.validSquares.push(getCellAt(this.row - 1, this.col - 2))
        }

        //KING
        if (this.type == "king") {
            this.validSquares.push(getCellAt(this.row + 1, this.col))
            this.validSquares.push(getCellAt(this.row + 1, this.col + 1))
            this.validSquares.push(getCellAt(this.row + 1, this.col - 1))
            this.validSquares.push(getCellAt(this.row - 1, this.col))
            this.validSquares.push(getCellAt(this.row - 1, this.col + 1))
            this.validSquares.push(getCellAt(this.row - 1, this.col - 1))
            this.validSquares.push(getCellAt(this.row, this.col + 1))
            this.validSquares.push(getCellAt(this.row, this.col - 1))

            //CASTLING
            if (!isInCheck && this.hasMoved == false) {
                if (getPieceAt(this.row, this.col + 1) == undefined &&
                    getPieceAt(this.row, this.col + 2) == undefined &&
                    getPieceAt(this.row, this.col + 3) !== undefined &&
                    getPieceAt(this.row, this.col + 3).type == "rook" &&
                    getPieceAt(this.row, this.col + 3).hasMoved == false) {

                    this.castleSquares.push([getCellAt(this.row, this.col + 2), getPieceAt(this.row, this.col + 3)]);
                }
                if (getPieceAt(this.row, this.col - 1) == undefined &&
                    getPieceAt(this.row, this.col - 2) == undefined &&
                    getPieceAt(this.row, this.col - 4) !== undefined &&
                    getPieceAt(this.row, this.col - 4).type == "rook" &&
                    getPieceAt(this.row, this.col - 4).hasMoved == false) {

                    this.castleSquares.push([getCellAt(this.row, this.col - 2), getPieceAt(this.row, this.col - 4)]);
                }
            }
        }

        //clean any undefined "valid squares"
        this.cleanValidSquares();

    }


    showPossibleMoves() {
        for (var square of this.validSquares) {
            square.style.backgroundImage = "url(Assets/veryLightSquare.png)";
        }
        for (var square of this.castleSquares) {
            square[0].style.backgroundImage = "url(Assets/veryLightSquare.png)";
        }
        for (var square of this.enPassantSquares) {
            square.style.backgroundImage = "url(Assets/veryLightSquare.png)";
        }
    }


    //filters out bad/impossible/undifined moves from the this.validSquares array
    cleanValidSquares() {
        var square;

        //prevents piece from moving onto an out-of-bounds/undefined square
        //using a reversed loop to prevent funny buisness when removing items from the array
        for (var i = this.validSquares.length - 1; i >= 0; i--) {
            square = this.validSquares[i];
            if (square == undefined) {
                this.validSquares.splice(i, 1)
            }
        }

        //prevents capturing of friendly pieces
        for (var i = this.validSquares.length - 1; i >= 0; i--) {
            square = this.validSquares[i];
            var coords = getCoordinates(square)
            var piece = getPieceAt(coords[0], coords[1])
            if (piece !== undefined &&
                piece.team == this.team) {
                this.validSquares.splice(i, 1)
            }
        }
    }


    //checks if the piece is able to move to the given square
    isValidMove(r, c) {
        var cell = getCellAt(r, c)
        for (var square of this.validSquares) {
            if (cell == square) {
                return true;
            }
        }

        return false;
    }


    isValidCastle(r, c) {
        var cell = getCellAt(r, c)
        for (var square of this.castleSquares) {
            if (cell == square[0]) {
                return square;
            }
        }

        return false;
    }

    isValidEnPassant(r, c) {
        var cell = getCellAt(r, c)
        for (var square of this.enPassantSquares) {
            if (cell == square) {
                return square;
            }
        }

        return false;
    }
}


//defines starting positions for all pieces
function resetPieces() {
    pieces = [];

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {

            //white pieces
            if (i == 1) {
                pieces.push(new Piece("pawn", "black", i, j))
            }
            if (i == 0 && (j == 0 || j == 7)) {
                pieces.push(new Piece("rook", "black", i, j))
            }
            if (i == 0 && (j == 1 || j == 6)) {
                pieces.push(new Piece("knight", "black", i, j))
            }
            if (i == 0 && (j == 2 || j == 5)) {
                pieces.push(new Piece("bishop", "black", i, j))
            }
            if (i == 0 && j == 3) {
                pieces.push(new Piece("queen", "black", i, j))
            }
            if (i == 0 && j == 4) {
                pieces.push(new Piece("king", "black", i, j))
            }

            //white pieces
            if (i == 6) {
                pieces.push(new Piece("pawn", "white", i, j))
            }
            if (i == 7 && (j == 0 || j == 7)) {
                pieces.push(new Piece("rook", "white", i, j))
            }
            if (i == 7 && (j == 1 || j == 6)) {
                pieces.push(new Piece("knight", "white", i, j))
            }
            if (i == 7 && (j == 2 || j == 5)) {
                pieces.push(new Piece("bishop", "white", i, j))
            }
            if (i == 7 && j == 3) {
                pieces.push(new Piece("queen", "white", i, j))
            }
            if (i == 7 && j == 4) {
                pieces.push(new Piece("king", "white", i, j))
            }
        }
    }
}

function animatePiece(piece, destination) {
    var destinationCoords = getCoordinates(destination)
    var startCoords = getCoordinates(piece.cell)
    let pieceCell = piece.cell;
    piece.cell.style = ("z-index: 10")
    setTimeout(function() { pieceCell.style = ("z-index: 0"); }, animationLength)

    var changeCoords = [
        (destinationCoords[0] - startCoords[0]) * 8.75,
        (destinationCoords[1] - startCoords[1]) * 8.75
    ]

    piece.cell.firstChild.animate([
        { transform: 'translate(0px, 0px)' },
        { transform: 'translate(' + changeCoords[1] + 'vmin, ' + changeCoords[0] + 'vmin)' }
    ], {
        duration: animationLength,
        iterations: 1,
    });
}

function clearCanBePassant() {
    for (piece of pieces) {
        piece.canBePassant = false;
    }
}


function canMovePiece(piece, cell) {
    var coords = getCoordinates(cell)
    var prevLoc = [piece.row, piece.col];
    piece.moveTo(coords[0], coords[1]);

    if (!checkForCheck(turn)) {
        piece.moveTo(prevLoc[0], prevLoc[1]);
        select(piece.cell);
        return true;
    } else {
        piece.moveTo(prevLoc[0], prevLoc[1]);
        select(piece.cell);
        return false;
    }
}


function canTakePiece(piece, cell) {
    var coords = getCoordinates(cell);
    var prevLoc = [piece.row, piece.col]
    var enemyPiece = getPieceAt(coords[0], coords[1])
    var index = pieces.indexOf(enemyPiece)
    pieces.splice(index, 1);
    piece.moveTo(coords[0], coords[1])

    if (!checkForCheck(turn)) {
        piece.moveTo(prevLoc[0], prevLoc[1])
        pieces.splice(index, 0, enemyPiece);
        enemyPiece.show();
        return true;
    } else {
        piece.moveTo(prevLoc[0], prevLoc[1])
        pieces.splice(index, 0, enemyPiece);
        enemyPiece.show();
        return false;
    }
}

function canCastle(piece, cell) {
    var prevLoc = [piece.row, piece.col]
    var coords = getCoordinates(cell);
    piece.moveTo(coords[0], (coords[1] + piece.col) / 2)

    if (!checkForCheck(turn)) {
        piece.moveTo(coords[0], coords[1])
        if (!checkForCheck(turn)) {
            piece.moveTo(prevLoc[0], prevLoc[1])
            select(piece.cell);
            return true;
        }
    }
    piece.moveTo(prevLoc[0], prevLoc[1])
    select(piece.cell);
    return false;
}

function canEnPassant(piece, cell) {
    var coords = getCoordinates(cell);
    var prevLoc = [piece.row, piece.col]
    if (piece.team == "white") {
        var enemyPiece = getPieceAt(coords[0] + 1, coords[1])
    } else {
        var enemyPiece = getPieceAt(coords[0] - 1, coords[1])
    }
    var index = pieces.indexOf(enemyPiece)
    pieces.splice(index, 1);
    piece.moveTo(coords[0], coords[1])

    if (!checkForCheck(turn)) {
        piece.moveTo(prevLoc[0], prevLoc[1])
        pieces.splice(index, 0, enemyPiece);
        return true;
    } else {
        piece.moveTo(prevLoc[0], prevLoc[1])
        pieces.splice(index, 0, enemyPiece);
        return false;
    }
}


function movePiece(piece, cell, isFinal) {
    clearCanBePassant()
    var coords = getCoordinates(cell)
    if (piece.type == "pawn" && Math.abs(piece.row - coords[0]) == 2) {
        piece.canBePassant = true;
    }

    if (isFinal) {
        piece.hasMoved = true
        animatePiece(piece, cell)
        setTimeout(function() {
            piece.hardMoveTo(coords[0], coords[1]);
            postMove()
        }, animationLength - 20)
    } else {
        piece.moveTo(coords[0], coords[1])
    }

}


function takePiece(piece, cell, isFinal) {
    clearCanBePassant()
    var coords = getCoordinates(cell);
    var index = pieces.indexOf(getPieceAt(coords[0], coords[1]))

    if (isFinal) {
        piece.hasMoved = true
        animatePiece(piece, cell)
        setTimeout(function() {
            pieces.splice(index, 1);
            piece.hardMoveTo(coords[0], coords[1]);
            postMove()
        }, animationLength - 20)
        prevGameStates = []
        cell.innerHTML = ""
    } else {
        pieces.splice(index, 1);
        piece.moveTo(coords[0], coords[1]);
    }

}

function castle(piece, cell, isFinal) {
    clearCanBePassant()
    var coords = getCoordinates(cell);
    var prevLoc = [piece.row, piece.col]
    var rook = piece.isValidCastle(coords[0], coords[1])[1];

    if (isFinal) {
        piece.hasMoved = true
        rook.hasMoved = true
        animatePiece(piece, cell)
        animatePiece(piece, getCellAt(coords[0], (coords[1] + prevLoc[1]) / 2))
        setTimeout(function() {
            piece.hardMoveTo(coords[0], coords[1]);
            rook.hardMoveTo(coords[0], (coords[1] + prevLoc[1]) / 2)
            postMove()
        }, animationLength - 20)
        rook.hasMoved = true;
    } else {
        piece.moveTo(coords[0], coords[1]);
        rook.moveTo(coords[0], (coords[1] + prevLoc[1]) / 2)
    }

}

function enPassant(piece, cell, isFinal) {
    clearCanBePassant()
    var coords = getCoordinates(cell);
    if (piece.team == "white") {
        var enemyPiece = getPieceAt(coords[0] + 1, coords[1])
    } else {
        var enemyPiece = getPieceAt(coords[0] - 1, coords[1])
    }
    var index = pieces.indexOf(enemyPiece)

    if (isFinal) {
        piece.hasMoved = true
        animatePiece(piece, cell)
        setTimeout(function() {
            pieces.splice(index, 1);
            piece.hardMoveTo(coords[0], coords[1]);
            postMove()
        }, animationLength - 20)
        enemyPiece.cell.innerHTML = ""
        prevGameStates = []
    } else {
        pieces.splice(index, 1);
        piece.moveTo(coords[0], coords[1]);
    }
}


function onClick(cell) {
    var coords = getCoordinates(cell) //coordinates of clicked cell
    var piece = getPieceAt(coords[0], coords[1]); //the piece at click location
    //var selectedPiece = if a piece has been selected by clicking on it


    if (piece !== undefined && piece.team == turn) { //if clicked cell has piece and its their turn

        if (selectedPiece == piece) { //deselect piece if you click it again
            selectedPiece = undefined
            clearHighlight()
            return
        } else if (!piece.hasAI) {
            selectedPiece = piece //set selected piece
            clearHighlight()
            selectedPiece.updateValidMoves();
            selectedPiece.showPossibleMoves();
            select(cell);
            return
        }

    } else if (selectedPiece !== undefined && //move to open space
        piece == undefined &&
        selectedPiece.isValidMove(coords[0], coords[1])) {

        if (canMovePiece(selectedPiece, cell)) {
            movePiece(selectedPiece, cell, true)
        } else {
            return;
        }

    } else if (selectedPiece !== undefined && //take piece
        piece !== undefined &&
        piece.team !== turn &&
        selectedPiece.isValidMove(coords[0], coords[1])) {

        if (canTakePiece(selectedPiece, cell)) {
            takePiece(selectedPiece, cell, true)
        } else {
            return;
        }

    } else if (selectedPiece !== undefined && //castling
        piece == undefined &&
        selectedPiece.isValidCastle(coords[0], coords[1]) !== false) {

        if (canCastle(selectedPiece, cell)) {
            castle(selectedPiece, cell, true)
        } else {
            return;
        }
    } else if (selectedPiece !== undefined && //enpassant
        piece == undefined &&
        selectedPiece.isValidEnPassant(coords[0], coords[1])) {

        if (canEnPassant(selectedPiece, cell)) {
            enPassant(selectedPiece, cell, true)
        } else {
            return;
        }
    } else {
        return;
    }
    selectedPiece = undefined
    setTimeout(attempAIMove, animationLength + 100);
}

function postMove() {
    clearHighlight()
    showPieces()
    changeTurns();
    checkForDraw()
    checkForCheck(turn);
    showCheck();
    checkForCheckmate(turn, true);
    selectedPiece = undefined;
}

resetPieces();

function eventClick(event) {

    var td = event.target;
    if (td.tagName == "TD") {
        onClick(td)
    } else if (event.target.parentNode.nodeName == "TD") {
        onClick(event.target.parentNode)
    }
}
//initiates the event delegator. runs onClick() every time the board is clicked
document.getElementById("board").addEventListener("click", eventClick)

for (var piece of pieces) { //displays pieces at start of game
    piece.show();
}

function showPieces() {
    for (var piece of pieces) {
        piece.show();
    }
}

/*

---------------AI---------------

*/

class AI {
    constructor(team, difficulty) {
        this.team = team
        this.difficulty = difficulty;
        this.validMoves - []
        this.gameState = new Array(10);
    }

    pushGameState(slot) {
        this.gameState[slot] = 0;
        this.gameState[slot] = _.cloneDeep(pieces)
    }

    popGameState(slot) {
        pieces = this.gameState[slot]
    }

    compileMoves(inputTeam) {
        var validMoves = [];
        for (var piece of pieces) {
            if (piece.team == inputTeam) {
                piece.updateValidMoves()
                for (var square of piece.validSquares) {
                    if (getPieceAt(getCoordinates(square)) == undefined &&
                        canMovePiece(piece, square)) {
                        validMoves.push([
                            [piece.row, piece.col], square, "move"
                        ])
                    } else if (getPieceAt(getCoordinates(square)) !== undefined &&
                        canTakePiece(piece, square)) {
                        validMoves.push([
                            [piece.row, piece.col], square, "move"
                        ])
                    }
                }
                if (piece.type == "king" && piece.castleSquares.length > 0) {
                    for (var square of piece.castleSquares) {
                        if (canCastle(piece, square[0])) {
                            validMoves.push([
                                [piece.row, piece.col], square[0], "castle"
                            ])
                        }
                    }
                }
                if (piece.type == "pawn" && piece.enPassantSquares.length > 0) {
                    for (var square of piece.enPassantSquares) {
                        if (canEnPassant(piece, square)) {
                            validMoves.push([
                                [piece.row, piece.col], square, "enPassant"
                            ])
                        }
                    }
                }
            }
        }
        return validMoves;
    }

    randomMove(input) {
        return input[randomInt(0, input.length - 1)]
    }

    bestNextMove(inputTeam, moves) {
        var validMoves = moves
        var score;
        var bestScore = -9999;
        var bestMoves = [];

        for (var move of validMoves) {
            this.pushGameState(0)
            this.softMove(move, false)
            score = evaluateGameScore(inputTeam)
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [];
                bestMoves.push(move);
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
            this.popGameState(0)
        }
        return this.randomMove(bestMoves);
    }

    bestMoveTwo(moves) {
        let validMoves = moves
        let score;
        let bestScore = -9999;
        let bestMoves = [];

        for (var move of validMoves) {
            this.pushGameState(1)
            this.softMove(move, false)
            if (!checkForCheckmate(enemy(this.team), false)) {
                this.softMove(this.bestNextMove(enemy(this.team), this.compileMoves(enemy(this.team))), false)
                score = evaluateGameScore(this.team)
                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [];
                    bestMoves.push(move);
                } else if (score === bestScore) {
                    bestMoves.push(move);
                }
                this.popGameState(1)
            } else {
                this.popGameState(1)
                return move;
            }
        }
        return this.randomMove(bestMoves);
    }

    softMove(move, isFinal) {
        var piece = getPieceAt(move[0][0], move[0][1])
        var destination = move[1]
        var moveType = move[2]
        var coords = getCoordinates(move[1])
        if (moveType == "move") {
            if (getPieceAt(coords[0], coords[1]) == undefined) {
                movePiece(piece, destination, isFinal)

            } else if (getPieceAt(coords[0], coords[1]) !== undefined) {
                takePiece(piece, destination, isFinal)
            }
        }
        if (moveType == "castle") {
            castle(piece, destination, isFinal)
        }
        if (moveType == "enPassasnt") {
            enPassant(piece, destination, isFinal)
        }
    }

    hardMove() {
        var move;
        if (this.difficulty === 0) {
            move = this.randomMove(this.compileMoves(this.team))
        } else if (this.difficulty === 1) {
            move = this.bestNextMove(this.team, this.compileMoves(this.team))
        } else if (this.difficulty === 2) {
            move = this.bestMoveTwo(this.compileMoves(this.team))
        }

        clearPieces();
        showPieces();
        clearHighlight()
        this.softMove(move, true)
        checkForCheckmate(turn, true);
        setTimeout(showPieces, animationLength)
        setTimeout(attempAIMove, animationLength + 100);
    }
}

var blackAI = new AI("black", 2)
    //var whiteAI = new AI("white", 0);
var whiteAI;

setTimeout(function() { attempAIMove(); }, 500);