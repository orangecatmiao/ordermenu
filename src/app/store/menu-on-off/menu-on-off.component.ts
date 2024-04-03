import { Component, OnInit } from '@angular/core';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu-on-off',
  templateUrl: './menu-on-off.component.html',
  styleUrls: ['./menu-on-off.component.scss'],
  providers:[Firehttp, Tool1, OgcatTool, OgcatDialog ]
})
export class MenuOnOffComponent implements OnInit {
  title ="菜單開關";
  list=[];
  category_list=[];
  price_list=[];

  category:string='';
  category_name:string='';
  userInfo;


  constructor(
    private http:Firehttp,
    private tool1:Tool1,
    private ogcatDialog: OgcatDialog,
    private ogcatTool:OgcatTool,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
    this.userInfo = this.tool1.getSessionUserInfo();
    this.getPrice();
  }

 //========================= 資料庫--取得資料 ===================================
  getPrice(){
    let app =this;
    let obj={ db:environment.db.price, uid: this.userInfo.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.price_list = data;
          app.getCategory();
      }
    });
  }

  getList(){
    let app =this;
    let ref;
    this.setCategoryName();
    if(this.category === ''){
      ref =  this.firestore.collection(environment.db.menu).ref.where('uid','==', this.userInfo.uid);
    }else{
      ref =  this.firestore.collection(environment.db.menu).ref.where('uid','==', this.userInfo.uid).where('category','==', this.category);
    }
  
    let obj={ ref:ref }
    this.http.getByUid(obj ,{
      success:function(data){
          app.list = data;
          app.ogcatTool.reSortWeek(app.list, 'sort');
          app.setStoreImageUrl();
          app.setPriceNameToList();
      }
    });
  }
   
  //取得菜單類別
  getCategory(){
    let app =this;
    let obj={ db:environment.db.category, uid: this.userInfo.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.category_list = data;
          if(data.length>0){
            app.category = data[0].id;
            app.getList();
            //app.reSortWeek(app.category_list);
          }
      }
    });
  }

  setCategoryName(){
    let app= this;
    this.category_list.forEach(function(val){
      if(val.id === app.category ){
        app.category_name = val.category;
      }
    });
  }

  //全部設定圖片網址
  setStoreImageUrl(){
    this.list.forEach(function(val){
      val.photo_upload = false;
      if(val.img_token!=''){
        let url = environment.firebase.imgserve+ 
        environment.firebase.storageBucket +
        '/o/'+ val.uid +'%2f'+ 
        val.img_name +'?alt=media&token='+ 
        val.img_token;
        
        val.img_full_url = url;
      }
    });
  }

  //將 price_name 值指定給 list 裡每個值
  setPriceNameToList(){
  let app= this;
  this.list.forEach(function(val){
     if(val.price_list==null){
      val.price_list =[];
     }
     if(val.price_list.length >0){
      val.price_list.forEach(function(pval){
        app.price_list.forEach(function(price_val){
          if(pval.price_id === price_val.id){  
            pval.price_name = price_val.price_name;
          }
        });  
      });
     }
  })
  }

  getCategoryList(){
    this.getList();
  }

  goUpdate(){
    let app =this;
    this.ogcatDialog.confirm("確認要修改?",{
     success:function(){
        app.update();
     }
   })
  }

  update(){
    let update_list=[];
    this.list.forEach(function(val){
      let obj ={
        id:val.id,
        on:val.on
      }
      update_list.push(obj);
    });
    this.http.updateMultiple(environment.db.menu, update_list, {
      success: function(data){
        
      }
    })
  }


}
