import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatTool, OgcatUser, OgcatDialog, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { environment } from '../../../environments/environment';
import { Tool1 } from '../../_factory/tool1/tool1';

@Component({
  selector: 'app-my-favorite',
  templateUrl: './my-favorite.component.html',
  styleUrls: ['./my-favorite.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, Tool1 ]
})
export class MyFavoriteComponent implements OnInit {
  uid;
  is_change=false;
  list=[];
  list_ori=[];


  searchStr: string;
  results: string[];
  db;

  constructor(
    private firestore: AngularFirestore,
    private firedatabase:AngularFireDatabase,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
    this.db =  environment.db.my_favorite;
  }

  ngOnInit(): void {
    this.getList();
  }



  getList(){
    let app =this;
    let obj={ db: this.db, uid: this.uid }
    this.http.getByUid(obj,{
      success:function(data){
        app.ogcatTool.reSortWeek(data,'sort');
        app.list = data;
        app.list_ori = JSON.parse(JSON.stringify(data));
        
      }
    });
  }

 
  goDelete(item){
    let app =this;
    this.ogcatDialog.confirm("刪除即無法復原，確定要刪除?",{
     success:function(){
        app.delete(item);
     }
   })
  }

  delete(item){
    let app =this;
    this.http.delete(this.db, item.id,{
      success: function(data){
        app.list = app.ogcatTool.deleteArrayByID(app.list, item.id , 'id');
      }
    });
  }

  goCancel(){
    let app =this;
    this.ogcatDialog.confirm("您目前操作的順序會消失，確定要復原?",{
     success:function(){
        app.cancel();
     }
   })
  }

  goEdit(){
    let app =this;
    this.ogcatDialog.confirm("確定要更新為目前的順序?",{
     success:function(){
        app.edit();
     }
   })
  }

  cancel(){
    this.reCoverList();
    this.is_change = false;
  }

  edit(){
    let update_list =this.getUpdateList();
    let app = this;
    this.http.updateMultiple(this.db, update_list, {
      success: function(data){
        app.reSetSort();
        app.list_ori = JSON.parse(JSON.stringify(app.list));
        app.is_change = false;
      }
    })
  }

  reSetSort(){
    this.list.forEach(function(val, key){
      val.sort = key;
    })
  }

  getUpdateList(){
    let u_list=[];
    this.list.forEach(function(val, key){
      let obj ={
        id: val.id,
        sort: key
      }
      u_list.push(obj);
    });
    return u_list;
  }

 //======================================================================================================


  //======================================================================================================
  //建議列表
  search(event) {
   
    let isChar = this.ogcatTool.isPureChinese(event.query);
    this.results = [];
    
    if(isChar){
      console.log(event.query);
      let app = this;
     
      this.list.forEach(function(val){
        if(val.store_name.indexOf(event.query)!=-1){
          app.results.push(val.store_name);
        }
      });
    }
  }

  searchSelected(str){
    let search_list =[];
    this.list.forEach(function(val){
      if(str === val.store_name){
        search_list.push(val);
      }
    });
    this.list = search_list;
  }


  searchClear(event){
    this.reCoverList()
  }

  reCoverList(){
    this.list = JSON.parse(JSON.stringify(this.list_ori));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
    this.is_change = true;
  }


}
