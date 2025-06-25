
let board, game, engine;
let playerColor = 'white';

function startGame() {
  playerColor = document.getElementById('color').value;
  game = new Chess();
  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    orientation: playerColor,
    onDrop: onDrop
  });

  engine = new Worker("https://cdn.jsdelivr.net/npm/stockfish@11/stockfish.js");

  if (playerColor === 'black') {
    makeEngineMove();
  }
}

function onDrop(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';
  board.position(game.fen());
  setTimeout(makeEngineMove, 250);
}

function makeEngineMove() {
  engine.postMessage('position fen ' + game.fen());
  engine.postMessage('go depth 15');
  engine.onmessage = function (event) {
    if (event.data.startsWith('bestmove')) {
      const bestMove = event.data.split(' ')[1];
      game.move({
        from: bestMove.substring(0, 2),
        to: bestMove.substring(2, 4),
        promotion: 'q'
      });
      board.position(game.fen());
      updateStatus();
    }
  };
}

function updateStatus() {
  if (game.game_over()) {
    document.getElementById('info').textContent = 'Game Over';
  }
}
