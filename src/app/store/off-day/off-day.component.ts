import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { StoreFunc } from '../../_factory/store-func/store-func';
import { ActionOffDay } from '../../_factory/action-off-day/action-off-day';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-off-day',
  templateUrl: './off-day.component.html',
  styleUrls: ['./off-day.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar, StoreFunc, ActionOffDay]
})
export class OffDayComponent implements OnInit {
  title:string ='休假設定';
  all_list=[];

  week_list=[
    { off:1, title:'星期一', rest:false },
    { off:2, title:'星期二', rest:false },
    { off:3, title:'星期三', rest:false },
    { off:4, title:'星期四', rest:false },
    { off:5, title:'星期五', rest:false },
    { off:6, title:'星期六', rest:false },
    { off:7, title:'星期日', rest:false },
  ];

  weekObj={off:'',week_list_change:false,id:''}
  
  
  db =  environment.db.off_day;
  cInfo :any ={ description:''};
  
  list:any =[];
  add_list:any =[];
  list_key:number =0;
  uid;
  list_max_length:number=50;
  menu_list=[];

  
  locale;

  constructor(
    private firestore: AngularFirestore,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private actionOffDay:ActionOffDay,
    private storeFunc:StoreFunc
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid; 
  }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
    this.isAddNew();
    this.getList();
  }

  getList(){
    let app =this;
    let obj={ db:this.db, uid: this.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.all_list = data;
          app.actionOffDay.separateListByType(app);
      }
    });
  }

 //=========================  資料庫 - 固定休假 =================================================

  createFix(){
    let app =this;
    let addObj =this.getEditObj();
    this.http.create(environment.db.off_day, addObj, {
      success:function(data){
        app.weekObj.id = data.id;
      }
    });

  }

  updateFix(){
    let app =this;
    let updateObj=this.getEditObj();
    
    this.http.update(environment.db.off_day, this.weekObj.id, updateObj, {
      success: function(data){

      }
    });
  }
 
 
  goUpdateFix(){
    let app =this;
    let html= `確定要更新?`;
    this.ogcatDialog.confirm(html,{
     success:function(){
        if(app.weekObj.id!=''){
          app.updateFix();
        }else{
          app.createFix();
        }
     }
   })
  }

  goRecoverFix(){
    let app =this;
    let html= `確定要復原?`;
    this.ogcatDialog.confirm(html,{
     success:function(){
       app.storeFunc.setWeekList(app.weekObj,  app.week_list);
     }
   })
  }

  getEditObj(){
    let c_list=[];
    this.week_list.forEach(function(val){
       c_list.push(val.rest)
    });
    let addObj ={
      type: 1,//1:固定休假 2:特定休假
      off: c_list.join(","),
      uid: this.uid
    }
    return addObj;
  }

  
 
 
 //=========================  資料庫 - 特定休假 =================================================
  goCreate(item, type){
    if(item.off==null || item.off==""){
      this.ogcatTool.showErrorMessage("必須填寫日期");
      return;
    }

    let early = this.calendar.isEarlyEqualObj(item.off);
    if(early){
      this.ogcatTool.showErrorMessage("日期不能小於今天");
      return;
    }
    let repeatObj = this.offdayRepeat(item);
    if(repeatObj.repeat > 0 ){
      this.ogcatTool.showErrorMessage(repeatObj.repeat_date+"--休假日期重複了 !");
      return;
    }
    this.create(item);
  }

  goDelete(item){
    let app =this;
    let html= `刪除即無法復原，確定要刪除 [${item.off}] ?`;
    this.ogcatDialog.confirm(html,{
     success:function(){
        app.delete(item);
     }
   })
  }

  create(item){
    let app =this;
    let addObj ={
      type: 2,//1:固定休假 2:特定休假
      off: this.calendar.getStrYMDbyObj(item.off, '/'),
      uid:app.uid
    }
    this.http.create(this.db, addObj,{
      success:function(data){
        addObj["id"] = data.id;
        addObj["week"] =  new Date(addObj.off).getDay();
        app.list.push(addObj);
        app.add_list = app.ogcatTool.deleteArrayByID(app.add_list, item.key , 'key');
     
        app.tool1.reSortWeek(app.list, 'off');
      }
    });
  }

  delete(item){
    let app =this;
    this.http.delete(this.db, item.id,{
      success: function(data){
        app.list = app.ogcatTool.deleteArrayByID(app.list, item.id , 'id');
        app.isAddNew();
      }
    });
  }

  offdayRepeat(item){
    let app =this;
    let repeat=0;
    let repeat_date='';
    this.list.forEach(function(val){
      if(new Date(val.off).getTime() == item.off.getTime()){
        repeat++;
        repeat_date= app.calendar.getStrYMDbyObj(item.off, '/');
      }
    });
    return{
      repeat: repeat,
      repeat_date: repeat_date
    }
  }
  //=========================  addNew  新增欄位 =================================================
  isAddNew(){
    if(this.list.length<this.list_max_length){
      this.addNew();
    }
  }

  addNew(){
    var item = {
      id:'',  off:'', key: this.list_key++,  add:0
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

//=========================  其他 html =================================================
  changeSwitch(){
    this.isChange();
   
  }

  isChange(){
    let app =this;
    
    let val = this.weekObj.off;
    let off_list = val.split(',');
    let ch =0;
    let add=0;

    if(this.weekObj.off!=''){
      off_list.forEach(function(val,key){ 
        let mk = (val=='true')?true:false;
        if(mk != app.week_list[key].rest){
         ch++;
        }
     });
    }else{
      this.week_list.forEach(function(val){
        if(val.rest){
          add++;
        }
      })
    }
   
    
    if(this.weekObj.off==''&& add>0){
      this.weekObj.week_list_change =true;
      return;
    }else if(this.weekObj.off==''&& add==0){
      this.weekObj.week_list_change =false;
      return;
    }else if(ch>0){
      this.weekObj.week_list_change =true;
    }else{
      this.weekObj.week_list_change =false;
    }
  }
 


}
