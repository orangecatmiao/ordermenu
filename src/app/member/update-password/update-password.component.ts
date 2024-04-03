import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as verfunc1 from '../../../../projects/ogcat-tool-package/src/lib/_function/veri-func';
import { OgcatTool } from '../../../../projects/ogcat-tool-package/src/lib/_factory/ogcat-tool'
import { Tool1 } from '../../_factory/tool1/tool1';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  providers:[OgcatTool, Tool1]
})
export class UpdatePasswordComponent implements OnInit {
  errorMsg;
  userInfo={
    displayName:'',
    email:'',
    emailVerified: false,
    metadata: null,
    uid: '',
    photoURL:'',
    providerId:'' 
  };
  cusForm = new FormGroup({
    oldPassword: new FormControl('',Validators.required,),// [Validators.required,Validators.minLength(4), verfunc1.email ]
    newPassword: new FormControl('',Validators.required,),
    newPasswordConfirm:new FormControl('',Validators.required,),
  });

  constructor( 
    private auth: AngularFireAuth, 
    private firestore: AngularFirestore,
    private ogcatTool: OgcatTool,
    private tool1:Tool1) { }

  ngOnInit(): void {
    this.userInfo = this.tool1.getSessionUserInfo();
  }
  

  
  confirmPassword(){
    this.errorMsg = "";
    if(this.cusForm.value.newPassword != this.cusForm.value.newPasswordConfirm){
      this.errorMsg = "您兩次輸入的密碼不相同";
      this.ogcatTool.showErrorMessage(this.errorMsg);
      return false;
    }
    return true;
  }

  variAccount(){
    let isgo = this.confirmPassword();
    if(!isgo){
      return;
    }
    let app =this;
    let email= JSON.parse(localStorage.userInfo).email;
    this.ogcatTool.loadingMask(true);
    let newPassword = this.cusForm.value.newPassword;
    let oldPassword = this.cusForm.value.oldPassword;
   
    this.auth.signInWithEmailAndPassword(email ,oldPassword).then(function(result) {
        app.update(result, newPassword);
     }).catch(function(error) {
        app.ogcatTool.showErrorMessage("修改密碼失敗");      
        app.ogcatTool.loadingMask(false);
        console.log("error",error)
     });
  }

 update(result, newPassword){
   let app = this;
  result.user.updatePassword(newPassword).then(function() {
    app.cusForm.controls.oldPassword.setValue('');
    app.cusForm.controls.newPassword.setValue('');
    app.cusForm.controls.newPasswordConfirm.setValue('');
    app.ogcatTool.showMessage("密碼修改成功!!"); 
  }).catch(function(error) {
    app.ogcatTool.showErrorMessage(error); 
  }).finally( ()=>{
    app.ogcatTool.loadingMask(false);
  }) ;
 }


} 

/**
 * 
 * https://firebase.google.com/docs/auth/web/manage-users#set_a_users_password
 * 
修改密碼
 var user = firebase.auth().currentUser;
var newPassword = getASecureRandomPassword();

user.updatePassword(newPassword).then(function() {
  // Update successful.
}).catch(function(error) {
  // An error happened.
});

 */
