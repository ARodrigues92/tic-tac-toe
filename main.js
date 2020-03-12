const ui = (() => { 
  const cells = document.querySelectorAll('.cell');

  const humanPlay = cell => {
    const cellNumber = cell.getAttribute('data-square');
    const span = document.createElement('span');
    span.append(cellNumber); // Change to players marks later
    cell.append(span);
  }

  cells.forEach (cell => { 
    cell.addEventListener('click', () => {
      humanPlay(cell);
    });
  });

})();