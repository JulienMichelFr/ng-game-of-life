import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CellStatus} from '../utils/types/cell-status.type';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {

  @Input() state: CellStatus = 'dead';

  constructor() { }

  ngOnInit(): void {
  }
}
