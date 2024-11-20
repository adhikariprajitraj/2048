class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
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
        }
    }

    updateBoard() {
        const tiles = this.gameBoard.children;
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const value = this.board[r][c];
                const tileIndex = r * this.boardSize + c;
                const tile = tiles[tileIndex];
                
                tile.textContent = value !== 0 ? value : '';
                tile.className = 'tile';
                if (value !== 0) {
                    tile.classList.add(`tile-${value}`);
                }
            }
        }
        
        this.scoreElement.textContent = this.score;
        this.updateBestScore();
    }

    updateBestScore() {
        const bestScore = localStorage.getItem('bestScore') || 0;
        if (this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
        this.bestScoreElement.textContent = localStorage.getItem('bestScore') || 0;
    }

    moveLeft() {
        let moved = false;
        for (let r = 0; r < this.boardSize; r++) {
            const row = this.board[r].filter(val => val !== 0);
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    this.score += row[c];
                    row.splice(c + 1, 1);
                    moved = true;
                }
            }
            while (row.length < this.boardSize) {
                row.push(0);
            }
            this.board[r] = row;
            moved = moved || !this.arraysEqual(this.board[r], this.board[r]);
        }
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
    }

    moveRight() {
        let moved = false;
        for (let r = 0; r < this.boardSize; r++) {
            const row = this.board[r].filter(val => val !== 0);
            for (let c = row.length - 1; c > 0; c--) {
                if (row[c] === row[c - 1]) {
                    row[c] *= 2;
                    this.score += row[c];
                    row.splice(c - 1, 1);
                    moved = true;
                }
            }
            while (row.length < this.boardSize) {
                row.unshift(0);
            }
            this.board[r] = row;
            moved = moved || !this.arraysEqual(this.board[r], this.board[r]);
        }
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
    }

    moveUp() {
        let moved = false;
        for (let c = 0; c < this.boardSize; c++) {
            const column = [];
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] !== 0) {
                    column.push(this.board[r][c]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            while (column.length < this.boardSize) {
                column.push(0);
            }
            
            for (let r = 0; r < this.boardSize; r++) {
                this.board[r][c] = column[r];
            }
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
    }

    moveDown() {
        let moved = false;
        for (let c = 0; c < this.boardSize; c++) {
            const column = [];
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] !== 0) {
                    column.push(this.board[r][c]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            
            while (column.length < this.boardSize) {
                column.unshift(0);
            }
            
            for (let r = 0; r < this.boardSize; r++) {
                this.board[r][c] = column[r];
            }
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateBoard();
            this.checkGameStatus();
        }
    }

    checkGameStatus() {
        // Check for 2048 win condition
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 2048) {
                    alert('Congratulations! You won!');
                    return;
                }
            }
        }

        // Check if game is over
        if (!this.canMove()) {
            alert('Game Over! No more moves possible.');
        }
    }

    canMove() {
        // Check if any cell is empty
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) return true;
            }
        }

        // Check for possible merges
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize - 1; c++) {
                if (this.board[r][c] === this.board[r][c + 1]) return true;
            }
        }

        for (let c = 0; c < this.boardSize; c++) {
            for (let r = 0; r < this.boardSize - 1; r++) {
                if (this.board[r][c] === this.board[r + 1][c]) return true;
            }
        }

        return false;
    }

    handleKeyPress(event) {
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

    resetGame() {
        this.score = 0;
        this.setupBoard();
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
