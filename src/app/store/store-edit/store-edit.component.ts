import { Component, OnInit } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFirestore } from '@angular/fire/firestore';
//import { AngularFireDatabase } from '@angular/fire/database';
//import { AngularFireStorage } from "@angular/fire/storage";
import { OgcatTool, OgcatUser, OgcatDialog, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { environment } from '../../../environments/environment';
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { Msub1 } from '../../_data-services/msub1';

@Component({
  selector: 'app-store-edit',
  templateUrl: './store-edit.component.html',
  styleUrls: ['./store-edit.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, Tool1 ]
})
export class StoreEditComponent implements OnInit {
  title = '';
  db= environment.db.store_info;// 'store-info';
  origin = location.origin;
  imageFile=environment.firebase.storeImgFileName;
  cInfo = {
    id:'',
    uid:'',
    store_name:'',
    
    img_token:'',
    img_url:'',
    img_full_url:'',
    img_name:'',
    description:'',
    created:'',
    updated:''
  }
  photo_upload:number =0;
  c_count:number =0;
  styleObj={
    file_input:{'height':'150px'}
  }

  user_id:string ='';
  //upoladPhoto;
  uid; 
  //downloadURL: Observable<string>;
  

  constructor(
    //private storage: AngularFireStorage, 
    //private firestore: AngularFirestore,
    //private firebase:AngularFireDatabase,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private msub1:Msub1
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
  }

  ngOnInit(): void {
    this.getInfo();
  }

  //==================== Emitter =================================
  onVotedPhoto(event){
    if(event.img_url!=null){
      this.cInfo.img_url = event.img_url;
      this.cInfo.img_name = event.img_name;
      this.setToken();
      this.save();
    }else if(event=='save'){
      this.save();
    }else if(event=='img-del'){
      this.cInfo.img_token ='';
      this.update();
    }
   
  }

 
  //=======================================================
  goSave(){
    this.ogcatTool.loadingMask(true);
    this.photo_upload++;
  }

  getInfo(){
    let app =this;
    let obj={ db:this.db, uid:this.uid }
    this.http.getByUid(obj, {
      success:function(data){ 
        if(data.length>0){
          app.setCInfo(data[0]);
        }
      }
    })
  }

  setCInfo(data){
    this.cInfo = data;
    this.cInfo['id'] = data.id;
   
    this.setStoreImageUrl();
    this.setQRCode();
  }

  //設定圖片全部網址
  setStoreImageUrl(){
    if(this.cInfo.img_token==''){
      return;
    }
    let url = environment.firebase.imgserve+ 
              environment.firebase.storageBucket +
              '/o/'+ this.uid +'%2f'+ 
              this.cInfo.uid +'?alt=media&token='+ 
              this.cInfo.img_token;
    this.cInfo.img_full_url = url;
    console.log("cInfo資料",this.cInfo)
  }

  setQRCode(){
    var qrcode = new QRCode("qr-store", {
      text:  origin + '/user/store-show/' + this.cInfo.id,
      width: 80,
      height: 80,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
    var qrcode2 = new QRCode("qr-menu", {
      text: origin + '/user/menu/' + this.cInfo.id,
      width: 80,
      height: 80,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }



  save(){
    let uid = this.cInfo.uid;
    if(uid==''){
      this.create();
    }else{
      this.update();
    }
  }


  create(){
    let app= this;
    let addObj= this.getObj();
    this.http.create(this.db, addObj, {
      success:function(data){
        app.cInfo['id'] = data.id;
        app.cInfo.uid = app.uid;
        app.cInfo.created = app.calendar.getStrYMDHMSbyObj(new Date());
        app.msub1.sendStoreInfo(app.cInfo);
      }
    });
  }


  update(){
    let app =this;
    let updateObj= this.getObj();
    this.http.update(this.db, this.cInfo['id'], updateObj, {
      success:function(data){
        app.cInfo.updated = app.calendar.getStrYMDHMSbyObj(new Date());
      }
    });
  }

  getObj(){
    let cObj={
      store_name: this.cInfo.store_name,
      description: this.cInfo.description,
      img_token:this.cInfo.img_token,
      uid:this.uid,
      bells:0
    };
    return cObj;
  }

  setToken(){
    var token = this.cInfo.img_url;
    var t_arr = token.split("&token=");
    this.cInfo.img_token =t_arr [1];
  }


}

















