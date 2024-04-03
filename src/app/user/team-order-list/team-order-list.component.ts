import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { Firehttp } from 'src/app/_service/firehttp';

import { AngularFirestore } from '@angular/fire/firestore';
import { OgcatTool,  OgcatDialog } from '../../../../projects/ogcat-tool-package/src/public-api';//OgcatUser,OgcatDataServices
import { environment } from 'src/environments/environment';
import { Tool1 } from '../../_factory/tool1/tool1';

@Component({
  selector: 'app-team-order-list',
  templateUrl: './team-order-list.component.html',
  styleUrls: ['./team-order-list.component.scss'],
  providers:[Firehttp, OgcatTool, OgcatDialog,Tool1]
})
export class TeamOrderListComponent implements OnInit {
  params;
  isModal:boolean = false;
  is_no_order:boolean = false;
  is_total:boolean = false;
  charge:boolean = false;//是否為團購負責人
  titleInfo ={ id:'',c_code:'',title:'', order_name:'', store_name:'', end:'', is_check:0, remark:'', created:''};
  cInfo;
  userInfo;
  orderInfo;
  order_list:Array<any>=[];
  socketObj={
    socketOrderUrl :"",
    socketOrderPayUrl:"",
  }

  constructor(
    private route: ActivatedRoute,
    private http:Firehttp,
    private firestore: AngularFirestore,
    private ogcatTool:OgcatTool,
    private tool1:Tool1,
    private ref: ChangeDetectorRef,
  ) {
    this.userInfo = this.tool1.getSessionUserInfo(); 
   }

  ngOnInit(): void {
    
    
    this.route.params.subscribe(params => {
      this.params = params;
      if(params.id!=null && params.id!=""){
       
      }
      /** 團購相關 */
      if(params.team_order_id!=null){
        this.getInfo();
        this.getOrder();
        //this.getDetail();
      }
   });
  }

  //===================================  Emit ================================================
  onVoted(obj:any) {
    if(obj.is_total !=null){
      this.is_total = obj.is_total;  //this.chRef.detectChanges();
      this.getOrder();
    }
  }

  checkOrder(event){

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
          app.socketObj.socketOrderUrl = environment.socketUrl.order + app.cInfo.uid+'/';
          app.socketObj.socketOrderPayUrl = environment.socketUrl.order_pay + app.cInfo.uid+'/';
      }
    })
  }
  

  getOrder(){
    let app = this;
    let obj={db:environment.db.team_order, id: this.params.team_order_id}; 
    this.http.getByID(obj, {
      success:function(data){
        if(data==null){
          app.is_no_order=true;
          return;
        }
        app.titleInfo =data;
        if(data.order_uid === app.userInfo.uid){
          app.charge = true;
        }
        app.getDetail();
      }
    });
  }

  //取得訂單詳細資料
  getDetail(){
    let app = this;
    let obj={db:environment.db.team_order_detail, ref:null}; 
    obj.ref = this.firestore.collection(obj.db).ref.where('order_id','==', this.params.team_order_id);
    this.http.getByUid(obj, {
      success:function(data){
        app.order_list =data;
        app.ref.detectChanges();
      }
    });
  
  }




}
