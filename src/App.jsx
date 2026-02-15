import React, { useState, useEffect } from 'react';
import Board from './Board';
import Controls from './Controls';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(generateInitialBoard());
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (isValidBoard(gameState.board, gameState.colors)) {
      setHasWon(true);
    }
  }, [gameState]);

  const handleCellClick = (row, col) => {
    if (hasWon) return; // Do not allow clicks if the game is already won

    const newBoard = gameState.board.map((r, rowIndex) =>
      r.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return cell === 'Q' ? '' : 'Q';
        }
        return cell;
      })
    );

    const newGameState = { ...gameState, board: newBoard };
    setGameState(newGameState);
  };

  console.log({ gameState });
  return (
    <div className="App">
      <h1>Queens Puzzle</h1>
      <Board
        board={gameState.board}
        colors={gameState.colors}
        onCellClick={handleCellClick}
      />
      {hasWon && (
        <div className="win-message">Congratulations! You have won!</div>
      )}
    </div>
  );
}

function generateInitialBoard() {
  const size = Math.floor(Math.random() * 6) + 5; // Random size between 5 and 10
  console.log({ size });
  const board = Array.from({ length: size }, () => Array(size).fill(''));
  console.table(board);
  const colors = generateColorZones(size);
  placeInitialQueens(board, colors);
  console.table(colors);
  return { board, colors };
}

function generateColorZones(size) {
  // Inicializamos el tablero vacío
  const colors = Array.from({ length: size }, () => Array(size).fill(null));
  
  // 1. Creamos "semillas" o centros para cada color
  const seeds = [];
  for (let i = 0; i < size; i++) {
    seeds.push({
      r: Math.floor(Math.random() * size),
      c: Math.floor(Math.random() * size),
      color: i
    });
  }

  // 2. Para cada casilla del tablero, buscamos cuál es la semilla más cercana
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let minDistance = Infinity;
      let closestColor = 0;

      for (const seed of seeds) {
        // Distancia Manhattan (simple y efectiva para cuadrículas)
        const distance = Math.abs(r - seed.r) + Math.abs(c - seed.c);
        
        // Si hay empate o es más cerca, nos quedamos con este color
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = seed.color;
        }
      }
      colors[r][c] = closestColor;
    }
  }

  // 3. (Opcional de seguridad) Aseguramos que al menos la casilla de la semilla tenga su color
  // Esto evita que un color quede totalmente "tapado" por otro
  seeds.forEach(seed => {
    colors[seed.r][seed.c] = seed.color;
  });

  return colors;
}

function placeInitialQueens(board, colors) {
  const size = board.length;
  const placedQueens = new Set();

  for (let color = 0; color < size; color++) {
    let row, col;
    let attempts = 0;
    let placed = false;

    // Intentamos colocar la reina 100 veces. Si no podemos, pasamos (para evitar bloqueo)
    while (attempts < 100 && !placed) {
      row = Math.floor(Math.random() * size);
      col = Math.floor(Math.random() * size);
      
      if (colors[row][col] === color && !placedQueens.has(`${row},${col}`)) {
        board[row][col] = 'Q';
        placedQueens.add(`${row},${col}`);
        placed = true;
      }
      attempts++;
    }
  }
}

function isValidBoard(board, colors) {
  const size = board.length;
  const rows = new Set();
  const cols = new Set();
  const diag1 = new Set();
  const diag2 = new Set();
  const colorZones = {};

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'Q') {
        if (
          rows.has(r) ||
          cols.has(c) ||
          diag1.has(r - c) ||
          diag2.has(r + c)
        ) {
          return false;
        }
        rows.add(r);
        cols.add(c);
        diag1.add(r - c);
        diag2.add(r + c);

        const color = colors[r][c];
        if (!colorZones[color]) {
          colorZones[color] = 0;
        }
        colorZones[color]++;
        if (colorZones[color] > 1) {
          return false;
        }
      }
    }
  }

  return Object.keys(colorZones).length === size;
}

export default App;
