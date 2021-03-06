import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CellStatus} from './utils/types/cell-status.type';
import {interval, Observable} from 'rxjs';
import {map, startWith, switchMap, takeUntil, takeWhile, tap} from 'rxjs/operators';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

type Grid = CellStatus[][];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('canvas') canvas: { nativeElement: HTMLCanvasElement };

  public form: FormGroup;

  public gridSize = 100;
  public generation = 0;
  public pause = false;
  private grid: Grid;

  grid$: Observable<Grid>;

  constructor(private fb: FormBuilder) {
    this.form = new FormGroup({
      gridSize: new FormControl(100, [Validators.min(0), Validators.max(60)]),
      period: new FormControl(150, [Validators.min(100), Validators.max(5000)]),
    });
  }


  public ngOnInit() {
    this.form.get('gridSize').valueChanges
      .pipe(
        startWith(this.form.get('gridSize').value),
      ).subscribe((size: number) => {
      this.gridSize = size;
      this.init(true);
    });
    this.start();
    this.grid$.subscribe();
  }

  init(randomize = false): Grid {
    this.grid = [];
    this.generation = 0;
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = randomize ? this.randomStatus() : 'dead';
      }
    }
    return this.grid;
  }

  randomStatus(): CellStatus {
    return Math.random() > 0.90 ? 'alive' : 'dead';
  }

  start() {
    this.grid$ = this.form.get('period').valueChanges.pipe(
      startWith(this.form.get('period').value),
      switchMap((period) => {
        return interval(period).pipe(
          takeWhile(() => !this.pause),
          tap(() => {
            this.getNextGrid();
            this.generation++;
          }),
          map(() => this.grid),
        );
      })
    );
  }

  getNextGrid() {
    console.time('Grid');
    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, 1000, 1000);
    const size = 1000 / this.gridSize;
    this.grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        const status = this.getNextStatus(i, j);
        this.grid[i][j] = status;
        if (status === 'alive') {
          ctx.fillRect(i * size, j * size, size, size);
        }
      });
    });
    console.timeEnd('Grid');
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

  togglePause() {
    this.pause = !this.pause;
    if (!this.pause) {
      this.start();
    }
  }
}
