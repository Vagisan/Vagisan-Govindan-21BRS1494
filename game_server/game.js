class Game {
  constructor() {
    this.board = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
    this.players = {
      P1: { pieces: [], name: "P1" },
      P2: { pieces: [], name: "P2" },
    };
    this.currentPlayer = "P1";
    this.initializeBoard();
  }

  initializeBoard() {
    // Initial setup for P1 (top row)
    this.players.P1.pieces = [
      { type: "H1", x: 0, y: 0 },
      { type: "P-I", x: 0, y: 1 },
      { type: "P-II", x: 0, y: 2 },
      { type: "P-III", x: 0, y: 3 },
      { type: "H2", x: 0, y: 4 },
    ];
    this.players.P1.pieces.forEach((piece) => {
      this.board[piece.x][piece.y] = { player: "P1", type: piece.type };
    });

    // Initial setup for P2 (bottom row)
    this.players.P2.pieces = [
      { type: "H1", x: 4, y: 0 },
      { type: "P-I", x: 4, y: 1 },
      { type: "P-II", x: 4, y: 2 },
      { type: "P-III", x: 4, y: 3 },
      { type: "H2", x: 4, y: 4 },
    ];
    this.players.P2.pieces.forEach((piece) => {
      this.board[piece.x][piece.y] = { player: "P2", type: piece.type };
    });
  }

  getBoard() {
    return this.board;
  }

  move(player, command) {
    const [characterName, direction] = command.split(":");
    const piece = this.players[player].pieces.find(
      (p) => p.type === characterName
    );
    if (!piece) return { error: "Invalid character." };

    const { x, y } = piece;
    let newX = x;
    let newY = y;
    let prevX = x;
    let prevY = y;

    if (characterName.startsWith("P-")) {
      // Pawn movement logic
      if (direction === "L") newY -= 1;
      if (direction === "R") newY += 1;
      if (direction === "F") newX += player === "P1" ? 1 : -1;
      if (direction === "B") newX += player === "P1" ? -1 : 1;
      prevX = prevY = 100; // No intermediate capture for pawns
    } else if (characterName === "H1") {
      if (direction === "L") {
        newY -= 2;
        prevY -= 1;
      }
      if (direction === "R") {
        newY += 2;
        prevY += 1;
      }
      if (direction === "F") {
        newX += player === "P1" ? 2 : -2;
        prevX += player === "P1" ? 1 : -1;
      }
      if (direction === "B") {
        newX += player === "P1" ? -2 : 2;
        prevX += player === "P1" ? -1 : 1;
      }
    } else if (characterName === "H2") {
      if (direction === "FL") {
        newX += player === "P1" ? 2 : -2;
        newY -= 2;
        prevX += player === "P1" ? 1 : -1;
        prevY -= 1;
      }
      if (direction === "FR") {
        newX += player === "P1" ? 2 : -2;
        newY += 2;
        prevX += player === "P1" ? 1 : -1;
        prevY += 1;
      }
      if (direction === "BL") {
        newX += player === "P1" ? -2 : 2;
        newY -= 2;
        prevX += player === "P1" ? -1 : 1;
        prevY -= 1;
      }
      if (direction === "BR") {
        newX += player === "P1" ? -2 : 2;
        newY += 2;
        prevX += player === "P1" ? -1 : 1;
        prevY += 1;
      }
    }

    // Check boundaries for the final destination
    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5)
      return { error: "Move out of bounds." };

    // Check if the target space is occupied by a friendly piece
    if (this.board[newX][newY] && this.board[newX][newY].player === player)
      return { error: "Invalid move, space occupied by your piece." };

    // Capture pieces at intermediate positions (only for H1 and H2)
    if (prevX !== 100 && prevY !== 100) {
      if (prevX >= 0 && prevX < 5 && prevY >= 0 && prevY < 5) {
        if (
          this.board[prevX][prevY] &&
          this.board[prevX][prevY].player !== player
        ) {
          this.capturePiece(this.board[prevX][prevY].player, prevX, prevY);
        }
      }
    }

    // Handle captures at the final destination
    if (this.board[newX][newY] && this.board[newX][newY].player !== player) {
      this.capturePiece(this.board[newX][newY].player, newX, newY);
    }

    // Update the board and piece position
    this.board[x][y] = null;
    this.board[newX][newY] = { player, type: piece.type };
    piece.x = newX;
    piece.y = newY;

    // Switch turn
    this.currentPlayer = this.currentPlayer === "P1" ? "P2" : "P1";

    // Check for a winner
    const winner = this.checkWinner();
    if (winner) {
      return { message: `Player ${winner} wins!`, board: this.board };
    }

    return { board: this.board };
  }

  capturePiece(player, x, y) {
    const pieceIndex = this.players[player].pieces.findIndex(
      (p) => p.x === x && p.y === y
    );
    if (pieceIndex > -1) this.players[player].pieces.splice(pieceIndex, 1);
    this.board[x][y] = null;
  }

  checkWinner() {
    if (this.players.P1.pieces.length === 0) return "P2";
    if (this.players.P2.pieces.length === 0) return "P1";
    return null;
  }
  restart() {
    this.board = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
    this.players = {
      P1: { pieces: [], name: "P1" },
      P2: { pieces: [], name: "P2" },
    };
    this.currentPlayer = "P1";
    this.initializeBoard();
  }
}

module.exports = { Game };
