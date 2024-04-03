import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IsOnTypePipe, NoSecondPipe, NoTimePipe, GenderPipe, WeekPipe, ShowWeekPipe } from './pipe1';


@NgModule({
  declarations: [ IsOnTypePipe, NoSecondPipe, NoTimePipe, GenderPipe,  WeekPipe, ShowWeekPipe,],
  imports: [
    CommonModule
  ],
  exports:      [ 
    IsOnTypePipe, NoSecondPipe, NoTimePipe, GenderPipe,WeekPipe, ShowWeekPipe,
  
  ],
})
export class PipeModule { }
