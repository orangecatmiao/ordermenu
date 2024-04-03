import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OgcatDataServices } from './_data-services/ogcat-data-services';

@Component({
  selector: 'lib-ogcat-tool-package',
  templateUrl: './ogcat-tool-package.component.html',
  styleUrls: ['./ogcat-tool-package.component.scss']
})
export class OgcatToolPackageComponent implements OnInit {
  msg ={
    success:false,
    error:false,
    text:""
  }
  loading_mask=false;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  subscription4: Subscription;

  constructor( private ds: OgcatDataServices,) {
    this.subscription1 = this.ds.getData().subscribe(x => { this.msg = x; });
    this.subscription2 = this.ds.getLoadingMask().subscribe(x => { this.loading_mask = x; });
   }

  ngOnInit(): void {
  }


  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    //this.subscription3.unsubscribe();
    //this.subscription4.unsubscribe();
  }


}
