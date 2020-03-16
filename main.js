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
  const buttons = document.querySelectorAll('.buttons');
  const nPlayersContainer = document.getElementById('n-player-selection');
  const namesFormContainer = document.getElementById('names-input');

  let nPlayers = 0;

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
      return false;
    }
  }

  const p1Play = (cell) => {
    play (cell);
    if (!isOver () && nPlayers === 1){
      game.changeTurn();
      aiPlay();
      if (!isOver ()){
        game.changeTurn ();
      }
    }else if (!isOver () && nPlayers === 2){
      game.changeTurn ()
    }
  }

  const aiPlay = () => {
    let move = game.minMax(game.players[1], game.board);
    const cell = document.querySelector(`.cell[data-square="${move.index}"]`);
    play(cell);
  }

  const play = cell =>  {
    const currentPlayer = game.getCurrentPlayer();
    const cellNumber = cell.getAttribute('data-square');
    const span = document.createElement('span');
    span.append(currentPlayer.mark);
    cell.append(span);
    game.setMark (currentPlayer, cellNumber);
  }

  const createPlayers = data => {
    const players = [];
    for (let element of data.elements){
      if (element.id === 'player1'){
        players[0] = (playerFactory(1, element.value || 'Player1', 'X'));
      }else if (element.id === 'player2'){
        players[1] = (playerFactory(2, element.value || 'Raskolnikov AI', 'O'));
      }
    }
    game.addPlayers(...players);
  }

  const start = function () {
    const form = document.querySelector('form');
    createPlayers(form);
  }

  cells.forEach (cell => { 
    const cellNumber = cell.getAttribute('data-square');
    cell.addEventListener('click', () => {
      if (!game.isSet(cellNumber) && !checkWinner() && nPlayers > 0){
        p1Play(cell);
      }
    });
  });

  buttons.forEach (button => {
    button.addEventListener('click', (e) => {
      if (button.value === 'sp'){
        nPlayers = 1;
        nPlayersContainer.classList.add('display-none');
        namesFormContainer.classList.remove('display-none');
      }else if (button.value === 'mp'){
        nPlayers = 2;
        nPlayersContainer.classList.add('display-none');
        namesFormContainer.classList.remove('display-none');
      }else if (button.value === 'start'){
        e.preventDefault();
        start();
      }
    });
  });
})();