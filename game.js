class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
        this.gameOver = false;
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.initializeEventListeners();
        this.setupBoard();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.newGameBtn.addEventListener('click', this.resetGame.bind(this));
        
        // Touch event support
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                diffX > 0 ? this.moveRight() : this.moveLeft();
            } else {
                // Vertical swipe
                diffY > 0 ? this.moveDown() : this.moveUp();
            }
        });
    }

    setupBoard() {
        this.board = Array.from({ length: this.boardSize }, () => 
            Array(this.boardSize).fill(0)
        );
        this.gameBoard.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tile');
            this.gameBoard.appendChild(cell);
        }
        
        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        this.updateBoard();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
            return true;
        }
        return false;
    }

    updateBoard() {
        const tiles = this.gameBoard.children;
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const value = this.board[r][c];
                const tileIndex = r * this.boardSize + c;
                const tile = tiles[tileIndex];
                
                tile.textContent = value || '';
                tile.className = 'tile';
                if (value !== 0) {
                    tile.classList.add(`tile-${value}`);
                }
            }
        }
        
        this.scoreElement.textContent = this.score;
        this.updateBestScore();
    }

    canMove() {
        // Check if any cell is empty
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) return true;
            }
        }

        // Check horizontal merges
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize - 1; c++) {
                if (this.board[r][c] === this.board[r][c + 1]) {
                    return true;
                }
            }
        }

        // Check vertical merges
        for (let c = 0; c < this.boardSize; c++) {
            for (let r = 0; r < this.boardSize - 1; r++) {
                if (this.board[r][c] === this.board[r + 1][c]) {
                    return true;
                }
            }
        }

        return false;
    }

    checkGameStatus() {
        // Check for 2048 win condition
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 2048) {
                    alert('Congratulations! You won!');
                    this.gameOver = true;
                    return;
                }
            }
        }

        // Check if game is over
        if (!this.canMove()) {
            this.gameOver = true;
            setTimeout(() => {
                alert('Game Over! No more moves possible.');
            }, 100);
        }
    }

    moveLeft() {
        if (this.gameOver) return false;
        
        let moved = false;
        for (let r = 0; r < this.boardSize; r++) {
            // Filter out zeros and create a copy of the row
            let row = this.board[r].filter(val => val !== 0);
            let newRow = [];

            // Merge tiles
            for (let i = 0; i < row.length; i++) {
                if (i < row.length - 1 && row[i] === row[i + 1]) {
                    // Merge equal adjacent tiles
                    newRow.push(row[i] * 2);
                    this.score += row[i] * 2;
                    i++; // Skip next tile
                    moved = true;
                } else {
                    newRow.push(row[i]);
                }
            }

            // Pad with zeros to maintain board size
            while (newRow.length < this.boardSize) {
                newRow.push(0);
            }

            // Check if the row actually changed
            if (!this.arraysEqual(this.board[r], newRow)) {
                moved = true;
            }
            this.board[r] = newRow;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
        
        return moved;
    }

    moveRight() {
        if (this.gameOver) return false;
        
        let moved = false;
        for (let r = 0; r < this.boardSize; r++) {
            // Filter out zeros and create a copy of the row
            let row = this.board[r].filter(val => val !== 0);
            let newRow = [];

            // Merge tiles from right to left
            for (let i = row.length - 1; i >= 0; i--) {
                if (i > 0 && row[i] === row[i - 1]) {
                    // Merge equal adjacent tiles
                    newRow.unshift(row[i] * 2);
                    this.score += row[i] * 2;
                    i--; // Skip previous tile
                    moved = true;
                } else {
                    newRow.unshift(row[i]);
                }
            }

            // Pad with zeros to maintain board size
            while (newRow.length < this.boardSize) {
                newRow.unshift(0);
            }

            // Check if the row actually changed
            if (!this.arraysEqual(this.board[r], newRow)) {
                moved = true;
            }
            this.board[r] = newRow;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
        
        return moved;
    }

    moveUp() {
        if (this.gameOver) return false;
        
        let moved = false;
        for (let c = 0; c < this.boardSize; c++) {
            // Extract column
            let column = [];
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] !== 0) {
                    column.push(this.board[r][c]);
                }
            }

            let newColumn = [];
            // Merge tiles from top to bottom
            for (let i = 0; i < column.length; i++) {
                if (i < column.length - 1 && column[i] === column[i + 1]) {
                    // Merge equal adjacent tiles
                    newColumn.push(column[i] * 2);
                    this.score += column[i] * 2;
                    i++; // Skip next tile
                    moved = true;
                } else {
                    newColumn.push(column[i]);
                }
            }

            // Pad with zeros to maintain board size
            while (newColumn.length < this.boardSize) {
                newColumn.push(0);
            }

            // Update column in the board
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] !== newColumn[r]) {
                    moved = true;
                }
                this.board[r][c] = newColumn[r];
            }
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
        
        return moved;
    }

    moveDown() {
        if (this.gameOver) return false;
        
        let moved = false;
        for (let c = 0; c < this.boardSize; c++) {
            // Extract column
            let column = [];
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] !== 0) {
                    column.push(this.board[r][c]);
                }
            }

            let newColumn = [];
            // Merge tiles from bottom to top
            for (let i = column.length - 1; i >= 0; i--) {
                if (i > 0 && column[i] === column[i - 1]) {
                    // Merge equal adjacent tiles
                    newColumn.unshift(column[i] * 2);
                    this.score += column[i] * 2;
                    i--; // Skip previous tile
                    moved = true;
                } else {
                    newColumn.unshift(column[i]);
                }
            }

            // Pad with zeros to maintain board size
            while (newColumn.length < this.boardSize) {
                newColumn.unshift(0);
            }

            // Update column in the board
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] !== newColumn[r]) {
                    moved = true;
                }
                this.board[r][c] = newColumn[r];
            }
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
        
        return moved;
    }

    resetGame() {
        this.score = 0;
        this.gameOver = false;
        this.setupBoard();
    }

    handleKeyPress(event) {
        // Prevent moves after game is over
        if (this.gameOver) return;

        switch(event.key) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowUp':
                this.moveUp();
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
        }
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
