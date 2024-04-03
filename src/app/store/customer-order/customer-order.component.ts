import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';

import { OgcatTool, OgcatUser, OgcatDialog, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { environment } from '../../../environments/environment';
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { map,filter, finalize } from "rxjs/operators";
import { Socket } from '../../_factory/socket/socket';
//import { Observable } from "rxjs";

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar, Socket ]
})
export class CustomerOrderComponent implements OnInit {


 // db='store-order';
  
  uid;
   //儲存目前所點選那筆訂單的詳細資料
  searchItem={id:'', order_name:'',  cancel:0,  is_pay: null, created:'', updated:'', store_remark:'',remark:'', cancel_remark:'',phone:'',  list:[],
              order_uid: '', cancel_uid:'', pay_day: '', pay_number: '', price: '',  store_id: '', store_uid: '',week:null
            };
  list=[];
  pageObj={
    all:false,
    page_count:100,//每頁顯示幾筆
    next:{},
    prev:{}
  }

  sortObj ={
    order_date:'desc'
  }

  searchObj={year:0, month:0, search_y_m:new Date() }
  locale;

  cusForm = new FormGroup({
    search_start: new FormControl(''),
    search_end: new FormControl(''),
    status:new FormControl(''),
  });
  //socketOrderUrl = 'checkpay/';
  //socketCancelUrl ='cancel/';
  params;

  socketObj={
    socketCancelUrl:'', 
    socketCheckPayUrl:'', 
  }
  
  constructor(
    private elementRef:ElementRef,
    //private storage: AngularFireStorage, 
    private firestore: AngularFirestore,
    private firedatabase:AngularFireDatabase,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private route: ActivatedRoute,
    private router: Router,
    private socket:Socket
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid; 
  }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
    this.getList();
    this.route.params.subscribe(params => {
      this.params = params;
    });
    this.router.events.subscribe(params => {
      console.log(params instanceof NavigationEnd) 
      if(params instanceof NavigationEnd){
        if(this.list.length>0){
          this.setParamsClass();
        }
      }
    });
  }

  
  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('.order-list').addEventListener('scroll', this.onScroll.bind(this));
  }
  
  onScroll(e){
    let ubottom=e.currentTarget.scrollHeight-e.currentTarget.scrollTop;
    ubottom = Math.floor(ubottom);
    let isBottom = ubottom === e.currentTarget.clientHeight;
  //  console.log(isBottom);
    if(isBottom){
      this.next();
    }
  }
 
  //=============== 資料庫-取得資料 ====================================
  getList(){
    let obj= this.getReadObj();
    let selectedlef = this.getRef(obj); 
    let ref=  selectedlef.limit(obj.limit);
    obj.ref =ref;
    this.accesssAPI(obj);
  }

  getRef(obj){
    let status = this.cusForm.value.status;
    let start = this.cusForm.controls.search_start.value;
    let end = this.cusForm.controls.search_end.value;

    let start_str;
    let end_str;

    if((start!=''&& end =='')  || start==''&& end !='' ){
      this.ogcatTool.showErrorMessage("開始與結束日期必需一起填");
      return;
    }


    if(start!='' && end !=''){
      start_str = this.calendar.getStrYMDbyObj(this.cusForm.controls.search_start.value, '/');
      end_str = this.calendar.getStrYMDbyObj(this.cusForm.controls.search_end.value, '/');
    }


    switch(status){
      case(""):
        if( (start==null && end ==null) || (start=='' && end =='') ){
          return this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).orderBy('created', 'desc');
        }else{
          return this.firestore.collection(obj.db).ref
          .where('store_uid','==', obj.uid)
          .where('created','>=', start_str + ' 00:00:00')
          .where('created','<=', end_str + ' 23:59:59')
          .orderBy('created', 'desc');
        }
       
      case("0"): case("1"):
        let m_status = parseInt(status);
        if( (start==null && end ==null) || (start=='' && end =='') ){
          return this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).where('cancel','==', m_status).orderBy('created', 'desc');
        }else{
          return this.firestore.collection(obj.db).ref
          .where('store_uid','==', obj.uid)
          .where('cancel','==', m_status)
          .where('created','>=', start_str + ' 00:00:00')
          .where('created','<=', end_str + ' 23:59:59')
          .orderBy('created', 'desc');
         
        }
     }
  }


  //=============== 資料庫-上下頁筆數 ====================================

  next(){
    //如果已經沒有資料了就不要再發 http request
    if(this.pageObj.all){
      return;
    }
    let obj= this.getReadObj();
    let selectedlef = this.getRef(obj); 
    let ref=  selectedlef.startAfter(this.pageObj.next).limit(obj.limit);
    obj.ref =ref;
   // console.log("呼叫阿");
    this.accesssAPI(obj, 'next');
  }

  accesssAPI(obj, act?){
    let app =this;
    this.http.getByUid(obj, {
      success:function(data, mpageObj){
        if(data.length==0){
          app.pageObj.all = true; 
          if(app.list.length === 0){
            app.list = data;
          }
        }else{
          if(app.list.length===0 || act==null){
            app.list = data;
          }else{
            app.list = app.list.concat(data);
          }
          console.log(data)
          app.setPageObj(mpageObj);
          app.setParamsClass();
        }
      },
      error:function(error){ }
    })
  }

  getReadObj(){
    let obj={ db: environment.db.store_order , uid:this.uid, limit:this.pageObj.page_count, ref:null }
    return obj;
  }

  setPageObj(mpageObj){
    this.pageObj.prev = mpageObj.prev;
    this.pageObj.next = mpageObj.next;
  }

  setParamsClass(){
    let app =this;
    if(app.params==null || app.params.id==null || app.params.id==''){
      return;
    }
    this.list.forEach(function(val){
      if(val.id === app.params.id){
        val.isChoose=1;
      }else{
        val.isChoose=0;
      }
    });
  }
  //================= 其他- html ==========================================
  showModal(item){
    this.searchItem = item;
    if(item.list==null){
      let obj= {ref:null, show:false};
      obj.ref= this.firestore.collection(environment.db.store_order_detail).ref
      .where('order_id','==', item.id)
      this.http.getByUid(obj, {
        success:function(data){
          item.list = data;
        }
      });
    }
    
    $('#orderInfoModal').modal("show");
  }

  hideModal(){
    $('#orderInfoModal').modal("hide");
  }

  goSearchByMnoth(){
    this.getList();
  }
  
  sort(item_name, rule){
    this.sortObj[item_name] = rule;
    
    if(item_name == 'order_date'){
      if(rule == 'asc'){
        this.sortOrderDateAsc(this.list, item_name);
      }else if(rule == 'desc'){
        this.sortOrderDateDesc(this.list, item_name)
      }
    }else{
      if(rule == 'asc'){
        this.sortAsc(this.list, item_name);
      }else if(rule == 'desc'){
        this.sortDesc(this.list, item_name)
      }
    }
  }

  confirmPayModalShow(){
    $("#confirmPayModal").modal("show");
  }

  confirmPayModalClose(){
    $("#confirmPayModal").modal("hide");
  }

  
  updatePay(){
    let updateObj={
      is_pay:1,
      store_remark:this.searchItem.store_remark
    }
    let app =this;
    this.http.update(environment.db.store_order, this.searchItem.id ,updateObj, {
      success:function(data){
         app.searchItem.is_pay =1;
         //關閉
         app.hideModal();
         app.confirmPayModalClose();
        //發送 ws
        // app.socketAddOrder(app.searchItem);
         app.infoWallAddOrderAct( app.searchItem.id, 'CP');
      }
    });
  }

  goCheckok(){
    let app =this;
    this.ogcatDialog.confirm("只能更改一次，更改後無法復原。結單後無法再取消訂單。確定要確認結單?",{
     success:function(){
        app.ckeckok();
     }
   })
  }

  ckeckok(){
    let updateObj={
      cancel:2
    }
    let app =this;
    this.http.update(environment.db.store_order, this.searchItem.id ,updateObj, {
      success:function(data){
         app.searchItem.cancel =2;
         
      }
    })
  }

  goCancel(){
    let app = this;
    let msg = `取消訂單即無法復原，您確定要取消此訂單? <span>請在以下輸入取消原因 (非必填)</span>`;
    let mobj={
      title:msg,
    }
    this.ogcatDialog.prompt(mobj,function(data){
      app.searchItem.cancel_remark = data;
      app.ckeckCancel();
    });   
  }

  ckeckCancel(){
    let updateObj={
      cancel:1,
      cancel_uid:this.uid,
      cancel_remark: this.searchItem.cancel_remark
    }
    let app =this;
    this.http.update(environment.db.store_order, this.searchItem.id ,updateObj, {
      success:function(data){
         app.searchItem.cancel =1;
          //發送 ws
          app.infoWallAddOrderAct( app.searchItem.id, 'C');
      }
    })
  }

 //================== 訊息牆相關  ============================================
 /**
  * 
  * @param order_id 
  * @param act E/P/C  E:訂單 P:付款 C:取消訂單 CP:確認付款
  */ 
 infoWallAddOrderAct(order_id:string, act){
   let app =this;
    let obj ={
      uid:this.searchItem.order_uid,
      ty:act,
      des:order_id,
      r:0
    };
    this.http.create(environment.db.info_wall , obj, {
      success:function(data){
        obj['info_wall_id'] = data.id;
        obj['order_id'] = obj.des;
        app.socketObj.socketCancelUrl = environment.socketUrl.cancel + app.searchItem.order_uid+'/';
        app.socketObj.socketCheckPayUrl = environment.socketUrl.check_pay+ app.searchItem.order_uid+'/';
        
        app.socket.chooseSocket(obj, app.socketObj);
      }
    })
}

//==================  websoket 相關  ============================================


  //---------------- 其他 private ----------------------
  private sortOrderDateAsc(list, field){
    list = list.sort(function (a, b) { 
      if(a[field] > b[field]){
        return 1; 
      }else if(a[field] == b[field]){
        return a.start > b.start ? 1:-1;//1後面 -1前面
      }else{
        return -1;
      }
    });
  }

  private sortOrderDateDesc(list, field){
    list = list.sort(function (a, b) { 
      if(a[field] > b[field]){
        return -1; 
      }else if(a[field] == b[field]){
        return a.start > b.start ? 1: -1;//1後面 -1前面
      }else{
        return 1;
      }
    });
  }

  private sortAsc(list, field){
    list = list.sort(function (a, b) { 
      return a[field] > b[field] ? 1 : -1;//1後面 -1前面
    });
  }

  private sortDesc(list, field){
    list = list.sort(function (a, b) { 
      return a[field] > b[field] ? -1 : 1;//1後面 -1前面
    });
  }


}



/*
goCancel(){
    let app =this;
    let msg ="取消的訂單無法復原。確定要取消訂單?";
    this.ogcatDialog.confirm(msg,{
     success:function(){
        app.ckeckCancel();
     }
   })
  }
*/











/**
  goSearchByMnoth(){
    let ym = this.calendar.getStrYMnoDashbyObj(this.cusForm.controls.search_y_m.value);
    let obj= this.getReadObj();
    let ref=  this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).where('order_ym','==', ym).limit(obj.limit);
    obj.ref =ref;
    this.accesssAPI(obj);
  }
 */

/**
   * confirmPay(){
    let app =this;
    this.ogcatDialog.confirm("只能更改一次，更改後無法復原。確定要確認此客戶已付款?",{
     success:function(){
        app.updatePay();
     }
   })
  }
   */

   /**
    next(){
      let obj= this.getReadObj();
      let ref= this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).orderBy('start', 'desc').startAfter(this.pageObj.next).limit(obj.limit);
      obj.ref =ref;
      this.accesssAPI(obj);
    }
    prev(){
    let obj= this.getReadObj();
    let ref=  this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).orderBy('start', 'desc').endBefore(this.pageObj.prev).limitToLast(obj.limit);
    obj.ref =ref;
    this.accesssAPI(obj);
  }
    */