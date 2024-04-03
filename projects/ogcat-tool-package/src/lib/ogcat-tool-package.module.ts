import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OgcatToolPackageComponent } from './ogcat-tool-package.component';



@NgModule({
  declarations: [OgcatToolPackageComponent],
  imports: [
    CommonModule,
  
  ],
  exports: [OgcatToolPackageComponent]
})
export class OgcatToolPackageModule { }
