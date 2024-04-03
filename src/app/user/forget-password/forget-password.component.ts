import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import * as verfunc1 from '../../../../projects/ogcat-tool-package/src/lib/_function/veri-func';
import { OgcatTool } from '../../../../projects/ogcat-tool-package/src/lib/_factory/ogcat-tool';
import { auth  } from "firebase/app";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
  providers:[OgcatTool]
})
export class ForgetPasswordComponent implements OnInit {

  send_mail=false;

  cusForm = new FormGroup({
    email: new FormControl('', [Validators.required, verfunc1.email ]),
  });

  constructor(
    private auth:AngularFireAuth,
    private ogcatTool:OgcatTool) { }

  ngOnInit(): void {
  }

  sendPasswordResetEmail(){
    let auth = this.auth;
    let emailAddress = this.cusForm.value.email;
    let app = this;
    this.ogcatTool.loadingMask(true);
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      app.ogcatTool.showMessage("信件寄送成功!!");
      app.cusForm.controls.email.setValue('');
      app.send_mail = true;
    }).catch(function(error) {
      app.ogcatTool.showErrorMessage(error);
    }).finally(()=>{
      app.ogcatTool.loadingMask(false);
    });
  }

}
/**
 *  https://firebase.google.com/docs/auth/web/manage-users#set_a_users_password
 * 发送重设密码电子邮

 */