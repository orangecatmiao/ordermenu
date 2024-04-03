import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayShow, ym, ZDay, OrderStatus, Nl2br, CheckStatus } from './pipe1';


@NgModule({
  declarations: [PayShow, ym, ZDay, OrderStatus, Nl2br, CheckStatus],
  imports: [
    CommonModule
  ],
  exports:[PayShow, ym, ZDay, OrderStatus, Nl2br, CheckStatus]
})
export class PipeModule1 { }
