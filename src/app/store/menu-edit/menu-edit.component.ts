import { Component, OnInit } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';

import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu-edit',
  templateUrl: './menu-edit.component.html',
  styleUrls: ['./menu-edit.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1]
})
export class MenuEditComponent implements OnInit {
  title ="菜單設定";
  db =  environment.db.menu;
 
  //imageFile=environment.firebase.storeImgFileName;
  
  error_msg:string ='';
  photo_max_size:number =1050000;//kb，圖片上傳大小限制
  photo_upload:number =0;
  photo_upload_count:number =0;
  list:any =[];
  category_list:any=[];//價格類別
  price_list:any=[];//菜單類別
  category:string='';
  category_name:string='';
  add_list:any =[];
  list_key:number =0;
  uid;
  list_max_length:number=20;

  is_price_list_sort:boolean=false;
  styleObj={
    image_tool:{'left':' -23px'},
    fa_times:{ 'font-size':'1em' }
  }
  
  constructor(
    //private auth:AngularFireAuth, 
    //private firedatabase :AngularFireDatabase,
    private firestore: AngularFirestore,
  
    private ds: OgcatDataServices,
    private ogcatTool:OgcatTool,
    //private ogcatUser:OgcatUser,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
  }

  ngOnInit(): void {
    //this.getList();
   // this.getCategory();
    this.getPrice();
  }

  
  //==================== Emitter =================================
  onVotedPhoto(event, item){
   // console.log(event)
    if(event.img_url!=null){
      item.img_url = event.img_url;
      item.img_name = event.img_name;
      this.setToken(item);
      
      if(item.id!='' && item.created!='' ){
        this.setItemImageUrl(item);
        item.loading = false;
        item.photo_upload =0;
        this.update(item);
      }else{
        this.photo_upload_count++;
      }
    }else if(event.act == 'read'){
      if(item.id!='' && item.created!=''){
        item.loading = true;
        item.imageFile =  this.uid + '/' + item.id;
        item.img_name = item.imageFile;
        if(item.photo_upload==null){
          item.photo_upload=0;
        }
        item.photo_upload++;
      } 
    }else if(event=='save'){
      this.photo_upload_count++; // this.save();
    }else if(event=='img-del'){
      item.img_token ='';
      item.img_name ='';
      this.update(item);
    }else if(event=='img-item-del'){//刪除item才觸發的

    }

    if(this.add_list.length === this.photo_upload_count ){
      this.setCreateArray();
      this.photo_upload_count=0;
      this.ogcatTool.loadingMask(false);
    }
   
  }

 
  //========================= 資料庫--取得資料 ===================================
  getPrice(){
    let app =this;
    let obj={ db:environment.db.price, uid: this.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.price_list = data;
          app.getCategory();
      }
    });
  }
  
  
  //取得菜單類別
  getCategory(){
    let app =this;
    let obj={ db:environment.db.category, uid: this.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.category_list = data;
          if(data.length>0){
            app.category = data[0].id;
            app.reSortWeek(app.category_list);
            app.getList();
          }
      }
    });
  }

  getList(){
    let app =this;
    let ref;
    this.setCategoryName();
    if(this.category === ''){
      ref =  this.firestore.collection(this.db).ref.where('uid','==', this.uid);
    }else{
      ref =  this.firestore.collection(this.db).ref.where('uid','==', this.uid).where('category','==', this.category);
    }
  
    let obj={ ref:ref }
    this.http.getByUid(obj ,{
      success:function(data){
          app.list = data;
          app.reSortWeek(app.list);
          app.addCategoryList();
          app.setStoreImageUrl();
          app.setPriceNameToList();
          if(app.list.length<app.list_max_length){
            app.add_list=[];
            app.addNew();
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


  //============================== 確認動作 ======================================
  goCreate(){
    this.error_msg='';
    if(this.category==''){
      this.error_msg = '必須選擇商品類別，若無類別必須建立。';
      this.ogcatTool.showErrorMessage(this.error_msg);
      return;
    }
    let checkObj = this.checkEmpty(); 
    if(checkObj.err_count > 0){
      this.error_msg = '您有欄位尚未填寫完成';
      this.ogcatTool.showErrorMessage(this.error_msg);
      return;
    }

    if(checkObj.add_count===0){
      this.error_msg = '目前無新資料';
      this.ogcatTool.showErrorMessage(this.error_msg);
      return;
    }


    let app =this;
    this.ogcatTool.loadingMask(true);
    this.add_list.forEach(function(val){
      val.imageFile =  app.uid + '/' +  new Date().getTime() +'-'+ val.key;
      val.img_name = val.imageFile;
      val.photo_upload++;
    })
  }

  goDelete(item){
    let app =this;
    this.ogcatDialog.confirm("刪除即無法復原，確定要刪除?",{
     success:function(){
        item.photo_delete=true;
        app.delete(item);
     }
   })
  }
  //====================  資料庫--新增/修改/刪除 ===================================
 
  update(item){
    let app =this;
    let updateObj = {
      category:item.category,
      name: item.name,
      price:item.price,
      img_token: item.img_token,
      img_name:item.img_name,
      price_list:item.price_list,
    };
    this.http.update(this.db, item.id, updateObj, {
      success:function(data){
        if(updateObj.category != app.category){
          app.list = app.ogcatTool.deleteArrayByID(app.list, item.id , 'id');
        }
        item.is_edit = false;
      }
    });
  }

 

  create(c_list){
    let app =this;
    this.http.createMultiple(this.db, c_list, {
      success:function(data){
        data.forEach(function(doc){
          doc.copy = JSON.parse(JSON.stringify(doc));
          app.list.push(doc);
        })
        app.reSortWeek(app.list);
        app.addCategoryList();
        app.setStoreImageUrl();
        app.setPriceNameToList();
        app.add_list=[];
        app.photo_upload_count =0;
        app.addNew();
      }
    })
  }

  delete(item){
    let app =this;
    this.http.delete(this.db, item.id,{
      success: function(data){
        app.list = app.ogcatTool.deleteArrayByID(app.list, item.id , 'id');
        //todo 刪除圖片
      }
    });
  }

  cancelDelete(item){
    item.price = item.copy.price;
    item.name = item.copy.name;
    item.category =item.copy.category;
    item.is_edit=false;
  }
  
  
  //====================  用到的額外動作--新增/修改/刪除 ===================================
  addCategoryList(){
    let app =this;
    this.list.forEach(function(val){
      val.category_list = JSON.parse(JSON.stringify(app.category_list));
    })  
  }

  checkEmpty(){
    let app =this;
    let err_count=0;
    let add_count=0;
    let a_list=[];
    this.add_list.forEach(function(val){
      let price_correct= app.checkPriceEmpty(val);
      if(val.name =='' && !price_correct ){
       // return;
      }else if((val.name !='' && !price_correct) || (val.name =='' && price_correct) ){
        val.empty = true;
        err_count++;
      }else if(  (val.name !='' && price_correct) ){
        add_count++;
        a_list.push(JSON.parse(JSON.stringify(val)) );
      }
    });
    return{
      err_count:err_count,
      add_count: add_count,
      a_list: a_list //沒用到
    };
  }

  checkPriceEmpty(val){
    let price_correct=false;
    if(val.price_list!=null && val.price_list.length>0){
      val.price_list.forEach(function(pr){
        if(pr.price!='' && pr.price>0){
          price_correct = true;
        }
      });
    }else{
      if(val.price != '' && val.price > 0){
        price_correct = true;
      }
    }
    return price_correct;
  }


  setCreateArray(){
    let app =this;
    let c_list=[];
    
    this.add_list.forEach(function(val){
      let price_correct= app.checkPriceEmpty(val);
      if(val.name !='' && price_correct ){ 
        val.category = app.category;
        //val.category_name = app.category_name;
        val.uid = app.uid;
       let aObj = JSON.parse(JSON.stringify(val));
        delete aObj.add;
        delete aObj.empty;
        delete aObj.id;
        delete aObj.imageFile;
        delete aObj.img_full_url;
        delete aObj.img_url;
        delete aObj.key;
        delete aObj.photo_upload; 
      
        //刪除 price_list 裡面的每個 price_name
        aObj.price_list.forEach(function(price_val){
          if(price_val.price == null || price_val.price == ''){
            aObj.price_list = app.ogcatTool.deleteArrayByID(aObj.price_list, price_val.price_id , 'price_id');
          }else{
            delete price_val.price_name;
          }
        })
        
        c_list.push(aObj);
      
      }
    });

    if(c_list.length ===0){
      return;
    }
    this.create(c_list);
  }


  setToken(item){
    var token = item.img_url;
    var t_arr = token.split("&token=");
    item.img_token =t_arr [1];
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

  setItemImageUrl(item){
    if(item.img_token!=''){
      let url = environment.firebase.imgserve+ 
      environment.firebase.storageBucket +
      '/o/'+ item.uid +'%2f'+ 
      item.img_name +'?alt=media&token='+ 
      item.img_token;
      
      item.img_full_url = url;
    }
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

//====================  html ===================================
  showEdit(item){
    item.is_edit =true;
  }
 
  getCategoryList(){
    this.getList();
  }

  //=========================  addNew  新增欄位 =================================================
  addNew(){
    var item = {
      id:'',  name:'',  price:'',  key: this.list_key++,  add:0,  on:true,
      photo_upload:0, img_full_url:'', img_name:'', img_token:'', imageFile:'', 
      price_list:[],
    }
    
    //請注意 add_list 必須先排序過
    if(this.price_list.length>0){
      if(!this.is_price_list_sort){
        this.reSortWeek(this.price_list);
        this.is_price_list_sort = true;
        //  HTMLDListElement.is_price_list_sort
      }
     
      this.price_list.forEach(function(val, key){
         let obj ={}
         obj['price_id'] = val.id;
         obj['price_name'] = val.price_name;
         obj['price']='';
         item.price_list.push(obj);
      });
    }
    this.add_list.push(item);
  }
  addNewRow(item){
    let old_length = this.list.length;
    let all = old_length + this.add_list.length;
    if(all>this.list_max_length){
      return;
    }
    
    if(item.add !=1 ){
      this.addNew(); 
      item.add =1;
    }
  }

  deleteNewRow(item){
    if(this.add_list.length > 1){
      this.ogcatTool.deleteArrayByID(this.add_list, item.key, 'key');
      this.add_list[this.add_list.length-1].add = 0;
    }
  }

  //陣列排序
  reSortWeek(list){
    list = list.sort(function (a, b) { 
      if(a.sort!=null && b.sort!=null){
        return parseInt(a.sort) > parseInt(b.sort) ? 1 : -1;//1後面 -1前面
      }else{
        return parseInt(a.name) > parseInt(b.name) ? 1 : -1;//1後面 -1前面
      }
     
    });
  }

 
}



/**
 *   create(item){
    let uid = this.uid;
    let app =this;
    let addObj ={
      during: item.during,
      price: item.price,
      uid:uid
		}
    this.http.create(this, this.db, addObj,{
      success:function(data){
        addObj["id"] = data.id;
        app.list.push(addObj);
        app.add_list = app.ogcatTool.deleteArrayByID(app.add_list, item.key , 'key');
        app.reSortWeek(app.list);
      }
    });
  }
 */