import { Component, OnInit } from '@angular/core';
import { OgcatTool, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  providers:[OgcatTool]
})
export class FooterComponent implements OnInit {
  display:boolean = true;
  constructor(
    private ogcatTool:OgcatTool,
    private ds: OgcatDataServices,
  ) { }

  ngOnInit(): void {
    this.issetPrivacy();
  }

  agreePrivacy(){
    //設定同意隱私權的 cookies 
    this.ogcatTool.setCookie("agreePrivacy", "1", 1000);
    this.display = false;
    this.ds.sendAgreePrivacy(true);
    this.loadGA();
  }

  issetPrivacy(){
    let isPrivacy = this.ogcatTool.getCookie("agreePrivacy");
    if(isPrivacy == "1"){
      this.display = false;
      this.loadGA();    
    }else if(isPrivacy == null){
      return;
    }
  
  }

  loadGA(){
    if(location.host!='ordermenu-cd859.web.app'){
      return;
    }
   // console.log("載入 GA !!")
    this.ogcatTool.addJS(environment.ga.jsloadpath + "?id="+environment.ga.id, this.gaLoaded);
  }

  gaLoaded(){
    window['dataLayer'] = window['dataLayer'] || [];
    function gtag(a,b){ window['dataLayer'].push(arguments);}
    gtag('js', new Date());
    gtag('config', environment.ga.id);
   
  }





}

