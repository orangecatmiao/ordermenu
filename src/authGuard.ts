import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subscription, iif } from 'rxjs';
import { Tool1 } from './app/_factory/tool1/tool1';
import { AngularFireAuth } from '@angular/fire/auth';
import { OgcatDataServices  } from '../projects/ogcat-tool-package/src/public-api';

@Injectable({
  providedIn: 'root'
})

export class authGuard implements CanActivate {
    
    subscription1: Subscription;
    userInfo={}

    constructor( 
      private auth:AngularFireAuth, 
      private router:Router,
      private ds: OgcatDataServices,
     ){
       
      
    }
    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
        console.log("有通過 guard")
        //取得登入者資訊
        //this.subscription1 = this.ds.getUser().subscribe(x => { debugger; this.userInfo = x; });
     

        if(localStorage.userInfo== null){
          this.router.navigate(['/user/login']);
          return false;
        }else{
          let user = JSON.parse(localStorage.userInfo);
          if(user.uid != null){
            return true;
          }
        }
    }


 }