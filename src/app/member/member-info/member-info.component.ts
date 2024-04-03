import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as verfunc1 from '../../../../projects/ogcat-tool-package/src/lib/_function/veri-func';
import { OgcatTool, OgcatUser, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';


@Component({
  selector: 'app-member-info',
  templateUrl: './member-info.component.html',
  styleUrls: ['./member-info.component.scss'],
  providers:[OgcatTool, OgcatUser]
})
export class MemberInfoComponent implements OnInit {
  cusForm = new FormGroup({
    email: new FormControl(''),// [Validators.required,Validators.minLength(4), verfunc1.email ]
    displayName: new FormControl(''),
   // photoURL: new FormControl(''),
  });
  userInfo={};
  constructor(  
    private auth: AngularFireAuth, 
    private firestore: AngularFirestore,
    private ogcatTool: OgcatTool,
    private ogcatUser:OgcatUser,
    private ref: ChangeDetectorRef,
    private ds: OgcatDataServices) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  
  getCurrentUser(){
    let app =this;

    this.auth.onAuthStateChanged(function(user) {
      if (user) {
        let userInfo = app.ogcatUser.setUserInfo(user);
        app.cusForm.patchValue(userInfo);
        //app.ref.detectChanges();
        //console.log(app.userInfo);
       
      } else {
        // No user is signed in.
      }
    });
  }


  update(){
       
    let app =this;
    this.ogcatTool.loadingMask(true);
    this.auth.onAuthStateChanged(function(user) {
      if (user) {
        user.updateProfile({
          displayName: app.cusForm.value.displayName,
        //  photoURL:  app.cusForm.value.photoURL,
        }).then(function(result) {
          //localStorage.userInfo.displayName = app.cusForm.value.displayName;
          app.setlocalStorage();
          app.ogcatTool.loadingMask(false);
          app.ogcatTool.showMessage("修改成功");
         // setTimeout(function(){app.ref.detectChanges();},30)
        }).catch(function(error) {
          console.log(error)
          // An error happened.
        });      
      } else {
        // No user is signed in.
      }
    });
  }


  setlocalStorage(){
    let sobj =JSON.parse(localStorage.userInfo);
    sobj.displayName = this.cusForm.value.displayName;
    localStorage.setItem("userInfo", JSON.stringify(sobj));
    this.ds.sendUser(sobj); 
  }


}
