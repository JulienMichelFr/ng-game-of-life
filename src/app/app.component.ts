import {Component, OnInit} from '@angular/core';
import {CellStatus} from './utils/types/cell-status.type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public gridSize = 25;
  grid: CellStatus[][];

  public ngOnInit() {
    this.init();
  }

  init(randomize = false) {
    this.grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = randomize ? this.randomStatus() : 'dead';
      }
    }
  }

  randomStatus(): CellStatus {
    return Math.random() > 0.5 ? 'dead' : 'alive';
  }

  randomize() {
    this.grid = this.grid.map((row) => {
      return row.map((v) => this.randomStatus());
    });
  }

  next() {
    this.grid = this.grid.map((row, i) => {
      return row.map((cell, j) => {
        return this.getNextStatus(i, j);
      });
    });
  }

  changeCellStatus(i: number, j: number): void {
    const status = this.grid[i][j];
    this.grid[i][j] = status === 'dead' ? 'alive' : 'dead';
  }

  /**
   * Any live cell with two or three live neighbours survives.
   * Any dead cell with three live neighbours becomes a live cell.
   * All other live cells die in the next generation. Similarly, all other dead cells stay dead.
   */
  getNextStatus(i: number, j: number): CellStatus {
    const neighbours: number = [
      this.getPos(i - 1, j),
      this.getPos(i - 1, j + 1),
      this.getPos(i, j + 1),
      this.getPos(i + 1, j + 1),
      this.getPos(i + 1, j),
      this.getPos(i + 1, j - 1),
      this.getPos(i, j - 1),
      this.getPos(i - 1, j - 1),
    ].filter((v) => v === 'alive').length;
    const status = this.getPos(i, j);
    if (status === 'alive' && [2, 3].includes(neighbours)) {
      return 'alive';
    }
    if (status === 'dead' && neighbours === 3) {
      return 'alive';
    }
    return 'dead';
  }

  getPos(i: number, j: number): CellStatus {
    if (i < 0 || i >= this.gridSize) {
      return 'dead';
    }
    if (j < 0 || j >= this.gridSize) {
      return 'dead';
    }
    return this.grid[i][j];
  }
}
