import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth  } from "firebase/app";
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as verfunc1 from '../../../../projects/ogcat-tool-package/src/lib/_function/veri-func';
import { OgcatTool, OgcatUser, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Router }from '@angular/router';
import { environment } from 'src/environments/environment';
//import { auth  } from "firebase/app";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers:[OgcatTool, OgcatUser]
})
export class LoginComponent implements OnInit {

  cusForm = new FormGroup({
    email: new FormControl('', [Validators.required,Validators.minLength(4), verfunc1.email ]),
    password: new FormControl(''),
  });
  showFbBtn = environment.showFBBtn;
  showGoogleBtn = environment.showGoogleBtn;

  @Input('isOuter') isOuter: boolean;

  constructor(
    private afauth: AngularFireAuth, 
    private firestore: AngularFirestore,
    private ogcatTool: OgcatTool,
    private ogcatUser:OgcatUser,
    private ds: OgcatDataServices,
    private router:Router) { }

  ngOnInit(): void {
    if(localStorage.userInfo != null){
      let user = JSON.parse(localStorage.userInfo);
      if(user.uid != null && !this.isOuter){
        this.router.navigate(['/member/member-info']);
      }
    }
   
  }

  login(){
    let app =this;
    this.ogcatTool.loadingMask(true);
    let email = this.cusForm.value.email;
    let password = this.cusForm.value.password;
    this.afauth.signInWithEmailAndPassword(email ,password).then(function(result) {
      
      app.ogcatTool.showMessage("登入成功");      
      app.ogcatTool.loadingMask(false);
      app.afterLogin(result);
     /*
      let userInfo = app.ogcatUser.setUserInfo(result.user);
       
      app.ds.sendUser(userInfo);
      if(app.isOuter){
        app.hideLoginModal();
      }else{
        app.router.navigate(['/member/member-info']);
      }
     
     */
     }).catch(function(error) {
        app.ogcatTool.showErrorMessage("登入失敗");      
        app.ogcatTool.loadingMask(false);
        console.log("error",error)
     });
  }


  afterLogin(result){
    let userInfo = this.ogcatUser.setUserInfo(result.user);
    this.ds.sendUser(userInfo);
    if(this.isOuter){
      this.hideLoginModal();
    }else{
      this.router.navigate(['/member/member-info']);
    }
  }



  fbLogin(){
    let app =this;
    var provider = new auth.FacebookAuthProvider(); //new firebase.auth.FacebookAuthProvider();provider.addScope('user_birthday');
    provider.addScope('email');
    this.afauth.signInWithPopup(provider).then((result) => {
      app.ogcatTool.showMessage("登入成功!");
      app.afterLogin(result);
    }).catch((error) => {
      app.ogcatTool.showErrorMessage("登入失敗!");
        console.log(error)
    });
   }

  googleLogin(){
    let app =this;
    var provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    this.afauth.signInWithPopup(provider).then(function(result:any) {
      app.ogcatTool.showMessage("登入成功!");
      app.afterLogin(result);
      //var token = result.credential.accessToken;// This gives you a Google Access Token.
      //var user = result.user;// The signed-in user info.
    }).catch((error) => {
      app.ogcatTool.showErrorMessage("登入失敗!");
        console.log(error)
    });
  }



  hideLoginModal(){
    $("#loginModal").modal("hide");
  }







}
