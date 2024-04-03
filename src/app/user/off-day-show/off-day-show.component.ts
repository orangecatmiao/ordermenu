import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { StoreFunc } from '../../_factory/store-func/store-func';
import { ActionOffDay } from '../../_factory/action-off-day/action-off-day';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-off-day-show',
  templateUrl: './off-day-show.component.html',
  styleUrls: ['./off-day-show.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar, StoreFunc, ActionOffDay]
})
export class OffDayShowComponent implements OnInit {
  
  title:string ='商店公休日';
  uid;
  db = environment.db.off_day;
  params;
  cInfo={
    id:'',
    uid:'',
    store_name:'',
    description:'',
    img_token:'',
    img_full_url:'',
  };
  all_list=[];
  week_list=[
    { off:1, title:'星期一', rest:false },
    { off:2, title:'星期二', rest:false },
    { off:3, title:'星期三', rest:false },
    { off:4, title:'星期四', rest:false },
    { off:5, title:'星期五', rest:false },
    { off:6, title:'星期六', rest:false },
    { off:7, title:'星期日', rest:false },
  ]
  list=[];
  weekObj={off:'',week_list_change:false,week_list_id:''}

  constructor(
    private firestore: AngularFirestore,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private storeFunc:StoreFunc,
    private actionOffDay:ActionOffDay,
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
      db: environment.db.store_info,
      id: this.params.id
    }
    this.http.getByID(obj, {
      success:function(data){
          if(data == null){
            return;
          }
          app.cInfo = data;
          app.getList();
      }
    })
  }

  getList(){
    let app =this;
    let obj={ db:this.db, uid: this.cInfo.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.all_list = data;
          app.actionOffDay.separateListByType(app);
      }
    });
  }

 



}
