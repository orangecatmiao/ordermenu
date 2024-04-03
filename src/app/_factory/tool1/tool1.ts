import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { TranslateService } from '@ngx-translate/core';
//import { Msub1 } from '../../_data-services/msub1'

@Injectable()

export class Tool1 {
     constructor(
      private auth:AngularFireAuth, 
      public translate: TranslateService,
     ){}

    getSessionUserInfo(){
        if(localStorage.userInfo !=null){
          return JSON.parse(localStorage.userInfo);
        }
        return '';
    }
  
    getCurrentUser(){
      let app =this;
      this.auth.onAuthStateChanged(function(user) {
        if (user) {
          
       
        } else {
          // No user is signed in.
        }
      });
    }

    getTransNameArr(arr){
      let app =this;
      let rArr=[];
      arr.forEach(function(val){
        app.translate.get(val).subscribe((trans_str) => {
          rArr[val]= trans_str;
        });
      }); 
      return rArr;
    }

    isShowLogin(){
      let userInfo =localStorage.userInfo;
      if(userInfo==null || userInfo==''){
        $("#loginModal").modal("show");
        return true;
      }
      return false;
    }

    checkPayInfo(day, number){
      let pay_day = true;
      let pay_number = true;
      if(day==null || day==''){
       pay_day =false;
      }
      if(number==null || number==''){
        pay_number = false;
      }
      
      if( (pay_day&&pay_number) || (!pay_day&&!pay_number) ){
       return true;
      }
      
      return false;
   }

    reSortWeek(list, e_name ){
      list = list.sort(function (a, b) { 
        return a[e_name] > b[e_name] ? 1 : -1;//1後面 -1前面
      });
    }

 


}
