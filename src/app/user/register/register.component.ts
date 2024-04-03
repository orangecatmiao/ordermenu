import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as verfunc1 from '../../../../projects/ogcat-tool-package/src/lib/_function/veri-func';
import { OgcatTool, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api'
//import { auth } from 'firebase/app';
import { auth } from 'firebase/app';  //firebase.auth.FacebookAuthProvider();
import { AngularFireAuth } from '@angular/fire/auth';

import { environment } from 'src/environments/environment';
import { HttpServices } from 'src/app/_service/http-services/http-services'
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Firehttp } from '../../_service/firehttp';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers:[OgcatTool, HttpServices, Firehttp]
})
export class RegisterComponent implements OnInit {
  hideloading:boolean =true;
  cusForm = new FormGroup({
    email: new FormControl('', [Validators.required,Validators.minLength(4), verfunc1.email ] ),
    password: new FormControl('', Validators.required),
    nickname:new FormControl('', [Validators.required,verfunc1.nickname ] ),
    agree: new FormControl('', Validators.requiredTrue),
    captcha:new FormControl('', Validators.requiredTrue),
    vcaptcha:new FormControl(false, Validators.requiredTrue),
    user_type:new FormControl('', Validators.required),
  });
 
  errorMsg:string ="";
  items: Observable<any[]>;
  subscription1: Subscription;
  r_count:number=0;
  login_type=0; //0:no 1:email 2:FB 3:google
  showFbBtn = environment.showFBBtn;
  showGoogleBtn = environment.showGoogleBtn;

  third_c_error:boolean = false;
  third_user_type:string ='';
  constructor(
    private http:Firehttp,
    private afauth: AngularFireAuth, 
    private router:Router,
    private firestore: AngularFirestore,
    private ogcatTool:OgcatTool,
    private ds: OgcatDataServices,
    private http2:HttpServices) { 
   // this.items = firestore.collection('employee').valueChanges();
   this.subscription1 = this.ds.getAgreePrivacy().subscribe(x => { 
     // this.agreePrivacy = x; 
      if(x == true){
        this.loadCaptcha();
      }
    });
  }
 
  ngOnInit(): void {
    if(localStorage.userInfo != null){
      let user = JSON.parse(localStorage.userInfo);
      if(user.uid != null){
        this.router.navigate(['/member/member-info']);
      }
    }else{
      this.issetPrivacy();
    }
    
   
 
  }

  issetPrivacy(){
    let isPrivacy = this.ogcatTool.getCookie("agreePrivacy");
    if(isPrivacy == "1"){
      this.loadCaptcha();    
    }else if(isPrivacy == null){
      return;
    }
  
  }

  loadCaptcha(){
    //console.log("載入機器人辨認!!")
    this.ogcatTool.addJS(environment.captcha.jsloadpath +"?render=" + environment.captcha.key, this.jsLoaded);
  }

  jsLoaded(){
  
  }

  checkRoboot(e) {
    let app =this;
    this.hideloading = false;
    e.preventDefault();
    grecaptcha.ready(function() {
      grecaptcha.execute(environment.captcha.key, {action: 'button'}).then(function(token) {
        app.isRoobot(token);
      });
    });
  }

  isRoobot(token){
    let app =this;
    let url = environment.captcha.siteverify+'?token='+token;
    $.ajax( {
      method: "GET",
      dataType: 'json',
      url: url,
      // data: {token:token}
      })
      .done(function(data) {
        app.hideloading = true;
        if(data && data.success == true){
          app.cusForm.controls.vcaptcha.setValue(true);
        }
       //console.log('驗證網址-A','https://www.google.com/recaptcha/api/siteverify?secret=6Le5oKkZAAAAAOaHhNBhlbKq_-rOAsN9gPXnOMVl&response='+token)
      })
      .fail(function(data) {})
      .always(function(data) {}); 
  }

 

  goRegister(){
    let app =this;
    this.errorMsg= "";
    this.ogcatTool.loadingMask(true);
    let email = this.cusForm.value.email;
    let password = this.cusForm.value.password;
    this.afauth.createUserWithEmailAndPassword(email, password).then(function(result) {
      result.user.sendEmailVerification().then(function() {
       
        setTimeout(function(){
          app.ogcatTool.showMessage("您已註冊成功，請驗證您的信箱");
        },400);
      }).catch((error)=>{
      }).finally(()=>{
          app.ogcatTool.loadingMask(false);
      });
      app.createMemberInfo(result.user, 1);
      app.updateUser();
     
     }).catch(function(error) {
          console.log("error",error)
          if(error.code == "auth/email-already-in-use"){
            app.errorMsg ="此信箱已被註冊";
          }else if(error.code == "auth/weak-password" ){
            app.errorMsg ="密碼強度至少需 6 個字";
          }else{
            app.errorMsg ="註冊失敗!";
          }
          app.ogcatTool.showErrorMessage(app.errorMsg);
     }).finally(()=>{
        app.ogcatTool.loadingMask(false);
     });
  }


  createMemberInfo(user, rtype){
    let app =this;
    let u_type = this.cusForm.controls.user_type.value
    if(rtype!=1){
      u_type =this.third_user_type; //u_type ='U';
    }
    let addObj={ 
      user_type:u_type,//this.cusForm.controls.user_type.value,
      uid:user.uid
    }
   
    this.http.create(environment.db.member_info, addObj, {
      success:function(data){
        app.r_count++;
        if(app.r_count==2){
          app.router.navigate(['/member/member-info']);
         }
      }
    });
  }

  updateUser(){
     // this.auth.currentUser
    let app =this;
    this.afauth.onAuthStateChanged(function(user) {
      if (user) {
        user.updateProfile({
          displayName: app.cusForm.value.nickname,//  photoURL:  app.cusForm.value.photoURL,
        }).then(function(result) {
          app.r_count++;
          if(app.r_count==2){
            app.router.navigate(['/member/member-info']);
           }
        }).catch(function(error) {
          console.log(error)
        });      
      } else {}
    });
  }

  fbLogin(){
    var provider = new auth.FacebookAuthProvider(); //new firebase.auth.FacebookAuthProvider();provider.addScope('user_birthday');
    provider.addScope('email');
    this.thirdPartyLogin(provider, 2, {} );
  }


  googleLogin(){
    let app =this;
    var provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    this.thirdPartyLogin(provider, 3, {
      success:function(result){
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
      }
    });
  }

  /**
   * 
   * @param provider firebase 第三方註冊物件
   * @param r_type 1:一般註冊  2:FB註冊 3:Google註冊
   * @param callback {success:funciton  , error:funciton}
   */
  thirdPartyLogin(provider, r_type:number, callback){
    let app =this;
    this.afauth.signInWithPopup(provider).then((result) => {
      app.createMemberInfo(result.user, r_type);
     
      if(r_type!=3){
        result.user.sendEmailVerification().then(function() {
          setTimeout(function(){
            app.ogcatTool.showMessage("您已註冊成功，請驗證您的信箱");
          },400);
        }).catch((error)=>{
       
        }).finally(()=>{
          app.ogcatTool.loadingMask(false);
        });
      }
 
      if(callback.success){
        callback.success(result);
      }
      setTimeout(function(){
        app.router.navigate(['/member/member-info']);
      },800);
      
  }).catch((error) => {
    if(callback.error){
      callback.error(error);
    }
    app.ogcatTool.showErrorMessage("登入失敗!");
      console.log(error)
    })
  }
  
/**
 * 
 * @param rtype : 2:fblogin  3:google login
 */
  goThirdLogin(rtype){
    this.third_c_error= false;
    if(this.third_user_type==null || this.third_user_type==''){
      this.third_c_error= true;
      return;
    }

    switch(rtype){
      case(2):
        this.fbLogin();
      break;

      case(3):
        this.googleLogin();
      break;
    }
  }
  

}

/**
 * 
 * isRootbot(){
  let url = environment.captcha.siteverify+'?token='+token;
  let app= this;
  this.http2.getCross(url).subscribe((carrier:any)=>{
    console.log("對阿",carrier)
  },error=>console.log( "錯誤阿",error));
}
 * 
 */














/**

 * 獲取用戶個人資料
 * var user = firebase.auth().currentUser;
var name, email, photoUrl, uid, emailVerified;

if (user != null) {
  name = user.displayName;
  email = user.email;
  photoUrl = user.photoURL;
  emailVerified = user.emailVerified;
  uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                   // this value to authenticate with your backend server, if
                   // you have one. Use User.getToken() instead.
}



寫入資料
	function create(){
		
		var db = firebase.firestore();
		var ref = db.collection('employee').doc();

		ref.set({
		name: "lala",
		month_salary: 500000,
		position:"專案經理"
		}).then(() => {
		console.log('set data successful');
		});
	}
 */