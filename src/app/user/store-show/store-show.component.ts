import { Component, OnInit } from '@angular/core';
//import { AngularFirestore } from '@angular/fire/firestore';
import { OgcatTool, OgcatDialog } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserAction } from './../../_factory/user-action/user-action';
import { Tool1 } from './../../_factory/tool1/tool1';

@Component({
  selector: 'app-store-show',
  templateUrl: './store-show.component.html',
  styleUrls: ['./store-show.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, UserAction, Tool1]
})
export class StoreShowComponent implements OnInit {

  db='store-info';
  cInfo={
    id:'',
    uid:'',
    store_name:'',
    description:'',
    img_token:'',
    img_full_url:'',
  };
  params;
  uid;
  dataObj= {user_uid:'', store_id:'', store_name:'', id:'', is_favorite:false, store_info:null}

  constructor( 
   // private firestore: AngularFirestore,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private tool1:Tool1,
    private userAction:UserAction,
    private http:Firehttp,
    private route: ActivatedRoute
  ) {
    this.uid = this.tool1.getSessionUserInfo().uid;
   }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.params = params;
      if(params.id!=null && params.id!=""){
        this.getInfo();
      }
   });
    

  
  }


  getInfo(){
    let app =this;
    let obj ={
      db:this.db,
      id: this.params.id
    }
    this.http.getByID(obj, {
      success:function(data){
          if(data == null){
            return;
          }
          app.cInfo = data;
          app.getFavorite();
          if(app.cInfo.img_token != ''){
            app.setImageUrl();
          }
      }
    })
  }

  setImageUrl(){
    let url = environment.firebase.imgserve+ 
    environment.firebase.storageBucket +
    '/o/'+ this.cInfo.uid +'%2f'+ 
    this.cInfo.uid +'?alt=media&token='+ 
    this.cInfo.img_token;
    this.cInfo.img_full_url = url;
  }

  getFavorite(){
    this.dataObj ={
     user_uid : this.uid, 
     store_id: this.cInfo.id, 
     store_name: this.cInfo.store_name, 
     id:'', 
     is_favorite:false, 
     store_info:null
    }
   this.userAction. getFavorite(this.dataObj);
 }
 
 favorite(){
   this.userAction.favorite(this.dataObj);
 }


}
