import { Component, OnInit } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFirestore } from '@angular/fire/firestore';
//import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1]
})
export class PriceComponent implements OnInit {
  title = '價格類別設定';
  db =  environment.db.price;
  cInfo :any ={ description:''};
  
  list:any =[];
  add_list:any =[];
  list_key:number =0;
  uid;
  list_max_length:number=3;
  menu_list=[];

  constructor(
    //private firedatabase :AngularFireDatabase,
    //private firestore: AngularFirestore,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
  }

  ngOnInit(): void {
    this.getList();
  }

  getList(){
    let app =this;
    let obj={ db:this.db, uid: this.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.list = data;
          app.reSortWeek(app.list);
          app.isAddNew();
      }
    });
  }

  showEdit(item){
    item.is_edit =true;
  }

  goCreate(item){
    if(item.price_name==null || item.price_name==""){
      this.ogcatTool.showErrorMessage("必須填價格類別名稱");
      return;
    }
    this.create(item);
  }

  goDelete(item){
    
    let app =this;
    let html= `刪除即無法復原，且所有商品裡的 [${item.price_name}] 價格會消失。確定要刪除?`;
   
    this.ogcatDialog.confirm(html,{
     success:function(){
        app.delete(item);
     }
   })
  }

  update(item){
    let app =this;
    let updateObj = {
      sort: item.sort,
      price_name: item.price_name
    
    };
    this.http.update(this.db, item.id, updateObj, {
      success:function(data){
        item.is_edit = false;
        app.reSortWeek(app.list);
      }
    });
  }

  create(item){
    let uid = this.uid;
    let app =this;
    let addObj ={
      sort: item.sort,
      price_name: item.price_name,
      uid:uid
		}
    this.http.create(this.db, addObj,{
      success:function(data){
        addObj["id"] = data.id;
        app.list.push(addObj);
        app.add_list = app.ogcatTool.deleteArrayByID(app.add_list, item.key , 'key');
     
        app.reSortWeek(app.list);
      }
    });
  }

  delete(item){
    let app =this;
    this.http.delete(this.db, item.id,{
      success: function(data){
        app.list = app.ogcatTool.deleteArrayByID(app.list, item.id , 'id');
        //更新
        app.getMneuByPrice(item.id);
        app.isAddNew();
      }
    });
  }


  deleteMenuPrice(priceID){
    let mlist = this.setCategoryEmptyMenuList(priceID);
    mlist['show'] = false;
    
    this.http.updateMultiple(environment.db.menu,  mlist , {
      function(data){
      
      }
    })
  }

  getMneuByPrice(priceID){
    let app= this;
    let obj={  db:environment.db.menu, uid:this.uid, show:false }
   
    this.http.getByUid(obj, {
      success:function(data){
        app.menu_list = data;
        app.deleteMenuPrice(priceID);
      }
    });
  }

  setCategoryEmptyMenuList(priceID){
    let app =this;
    let mlist =[];
    this.menu_list.forEach(function(val){
      let cobj = JSON.parse(JSON.stringify(val));
      cobj.price_list.forEach(function(price_val){
          if(price_val.price_id === priceID){
            cobj.price_list = app.ogcatTool.deleteArrayByID(cobj.price_list, price_val.price_id , 'price_id');
          }
      });
      let obj={
        id: cobj.id,
        price_list: cobj.price_list
      }
      mlist.push(obj);
    });
    return mlist;
  }


  cancelDelete(item){
    item.price_name = item.copy.price_name;
    item.is_edit=false;
  }
  //=========================  addNew  新增欄位 =================================================
  isAddNew(){
    if(this.list.length<this.list_max_length){
      this.addNew();
    }
  }

  addNew(){
    var item = {
      id:'',  price_name:'', sort:'', key: this.list_key++,  add:0
    }
    this.add_list.push(item);
  }
  addNewRow(item){
    let old_length = this.list.length;
    let all = old_length + this.add_list.length;
    
    if(all===this.list_max_length){
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
      return parseInt(a.sort) > parseInt(b.sort) ? 1 : -1;//1後面 -1前面
    });
  }

}
