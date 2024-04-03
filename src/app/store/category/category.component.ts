import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1]
})
export class CategoryComponent implements OnInit {
  title = '菜單類別設定';
  db =  environment.db.category;
  cInfo :any ={ description:''};
  
  list:any =[];
  add_list:any =[];
  list_key:number =0;
  uid;
  list_max_length:number=50;
  menu_list=[];

  constructor(
    //private firedatabase :AngularFireDatabase,
    private firestore: AngularFirestore,
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
    if(item.category==null || item.category==""){
      this.ogcatTool.showErrorMessage("必須填菜單類別名稱");
      return;
    }
    this.create(item);
  }

  goDelete(item){
    let app =this;
    let html= `刪除即無法復原，且原本歸類為 [${item.category}] 的所有商品類別會變成空白。確定要刪除?`;
    this.ogcatDialog.confirm(html,{
     success:function(){
        app.delete(item);
     }
   })
  }

  update(item){
    let app =this;
    let updateObj = {
      sort:item.sort,
      category: item.category
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
    if(item.sort==null){
      item.sort ='';
    }
    let addObj ={
      sort:item.sort,
      category: item.category,
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
        app.getMneuByCategory(item.id);
        app.isAddNew();
      }
    });
  }

  deleteMenuCategory(ctegoryID){
      let mlist = this.setCategoryEmptyMenuList();
      mlist['show'] = false;
      
      this.http.updateMultiple(environment.db.menu,  mlist , {
        function(data){
        
        }
      })
  }

  getMneuByCategory(ctegoryID){
      let app= this;
      let obj={ ref:null, show:false }
      obj.ref = this.firestore.collection(environment.db.menu).ref
      .where('uid','==', this.uid)
      .where('category','==', ctegoryID);
      this.http.getByUid(obj, {
        success:function(data){
          app.menu_list = data;
          app.deleteMenuCategory(ctegoryID);
        }
      });
  }

  setCategoryEmptyMenuList(){
      let mlist =[];
      this.menu_list.forEach(function(val){
        let cobj = JSON.parse(JSON.stringify(val));
        let obj={
          id:cobj.id,
          category:''
        }
        mlist.push(obj);
      });
      return mlist;
  }


  cancelDelete(item){
    item.category = item.copy.category;
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
      id:'',  category:'', key: this.list_key++,  add:0
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
      return parseInt(a.sort) > parseInt(b.sort) ? 1 : -1;//1後面 -1前面
    });
  }


}


/**
 * let addObj ={
      category: item.category,
      uid:this.uid
    }
    let array =[addObj, {category:'這是多的哇哈哈',uid:this.uid},{category:'你管我',uid:this.uid},{category:'NO',uid:this.uid}]
    var db = this.firestore.firestore ;
    var batch = db.batch();
    array.forEach((doc) => {
      var docRef = db.collection(this.db).doc(); //automatically generate unique id
      batch.set(docRef, doc);
    });
    batch.commit()





     test(ctegoryID){
  //this.firestore.collection(environment.db.menu).ref.where('category','==', ctegoryID).firestore.doc('').update({category:'cccccc'});
  //this.firedatabase.database.ref
  //this.firestore.firestore.batch().update
  

 }

 */