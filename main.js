const playerFactory = (id, name, mark) => {
  let playerScore = 0;
  return {id ,name, mark, playerScore};
}

const game = (() => {
  const board = [0,1,2,3,4,5,6,7,8];
  const players = [];
  let playerTurn = 0;

  return{
    addPlayers : function (p1, p2) {
      players.push (p1, p2);
    },
    getCurrentPlayer : function () {
      return players[playerTurn];
    },
    setMark : function (player, position) {
      board[position] = player.mark;
    },
    changeTurn : function () {
      playerTurn === 0 ? playerTurn = 1 : playerTurn = 0;
    },
    isSet : function (position) {
      return typeof board[position] === 'number' ? false : true;
    },
    clearBoard : function () {
      board.splice(0, board.length);
    },
    getAvailSquares : function () {
      const availSquares = [];

      for (let i = 0; i<9; i++){
        if (typeof board[i] === 'number'){
          availSquares.push(i);
        }
      }

      return availSquares;
    },
    isTie : function (){
      return this.getAvailSquares().length === 0 ? true : false;
    },
    isWinner : function (player, board){
      const combos = ['012', '345', '678', '036', '147', '258', '048', '246'];
      let result = false;

      const plays = board.reduce ((acummulator, element, index) => {
        if (element === player.mark) {
          return acummulator.concat (index);
        }else {
          return acummulator;
        }
      }, '');

      combos.forEach ((combo) => {
        if (!result) {
          for (let i = 0; i < 3; i++) {
            if (!plays.includes(combo.charAt(i))) {
              break;
            }
            if (i === 2) {
              result = {combo : combo, player: player};
            }
          }
        }
      });
      return result;
    },
    minMax : function (player, nBoard){
      const availSquares = this.getAvailSquares();

      if (game.isWinner (players[0], nBoard)){
        return {score : -10};
      }else if (game.isWinner(players[1], nBoard)){
        return {score : 10};
      }else if (availSquares.length ===  0){
        return {score : 0}
      }

      const moves = [];

      for (let i = 0; i < availSquares.length; i++){
        let move = {};
        move.index = nBoard[availSquares[i]];
        nBoard[availSquares[i]] = player.mark;

        if (player.id === 2){
          let result = game.minMax (players[0], nBoard);
          move.score = result.score;
        }else{
          let result = game.minMax (players[1], nBoard);
          move.score = result.score;
        }

        nBoard[availSquares[i]] = move.index;
        moves.push(move);
      }

      let bestMove;
      if (player.id === 2){
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++){
          if (moves[i].score > bestScore){
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }else{
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++){
          if (moves[i].score < bestScore){
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }
      return (moves[bestMove]);
    },
    board,
    players
  }
})();


const ui = (() => { 
  const cells = document.querySelectorAll('.cell');

  const paintSquares = cells => {
    for (let i=0; i<3; i++){
      let wCell = document.querySelector(`.cell[data-square="${cells[i]}"]`);
      wCell.style.backgroundColor = ('green');
    }
  }

  const checkWinner = () => {
    let currentPlayer = game.getCurrentPlayer();
    return (game.isWinner(currentPlayer, game.board));
  }

  const isOver = () => {
    if (checkWinner ()){
      paintSquares(checkWinner().combo);
      return true;
    }else if (game.isTie()){
      alert('tie');
      return true;
    }else{
      game.changeTurn();
      return false;
    }
  }

  const p1Play = (cell) => {
    play (cell);
    if (!isOver ()){
      aiPlay();
    }
  }

  const aiPlay = () => {
    let move = game.minMax(game.players[1], game.board);
    const cell = document.querySelector(`.cell[data-square="${move.index}"]`);
    play(cell);
    game.changeTurn();
  }

  const play = cell =>  {
    const currentPlayer = game.getCurrentPlayer();
    const cellNumber = cell.getAttribute('data-square');
    const span = document.createElement('span');
    span.append(currentPlayer.mark);
    cell.append(span);
    game.setMark (currentPlayer, cellNumber);
  }

  cells.forEach (cell => { 
    const cellNumber = cell.getAttribute('data-square');
    cell.addEventListener('click', () => {
      if (!game.isSet(cellNumber) && !checkWinner()){
        p1Play(cell);
      }
    });
  });
})();

player1 = playerFactory (1, 'Andre', 'X');
player2 = playerFactory (2, 'Raskol', 'O');

game.addPlayers(player1, player2);