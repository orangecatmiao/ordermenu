import { Component, ElementRef } from '@angular/core';
import { Msub1 } from './_data-services/msub1';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[Msub1, ]
})
export class AppComponent {
  title = 'ordermenu';
  is_show_info_wall;

  constructor(
    private elementRef:ElementRef,
    private msub1:Msub1
  ){
  }


  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('.container-fluid').addEventListener('click', this.onClick.bind(this));
  }
  
  onClick(){
    this.msub1.sendInfoWall(false);
  }

}
