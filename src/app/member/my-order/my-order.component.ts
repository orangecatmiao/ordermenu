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
import { Socket } from '../../_factory/socket/socket';

@Component({
  selector: 'app-my-order',
  templateUrl: './my-order.component.html',
  styleUrls: ['./my-order.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar, Socket ]
})
export class MyOrderComponent implements OnInit {
  uid;
   //儲存目前所點選那筆訂單的詳細資料
  searchItem={id:'', order_name:'', is_pay: null, created:'', updated:'',cancel:0, cancel_remark:'',store_remark:'', remark:'', phone:'', list:[],
              order_uid: '', cancel_uid:'',  pay_day: '', pay_number: '', price: '', store_id: '', store_uid: '', 
              copy:{pay_day:'',is_pay:0, pay_number:'',cancel:0}
            };
  list=[];
  pageObj={
    all:false,
    page_count:100,//每頁顯示幾筆
    next:{},
    prev:{}
  }

  cusForm = new FormGroup({
    search_start: new FormControl(''),
    search_end: new FormControl(''),
    status:new FormControl(''),
  });

  locale;

  sortObj ={
    order_date:'desc'
  }

  params;
  socketObj={
    socketCancelUrl:'', 
    socketPayUrl:'', 
  }

  constructor( 
    private elementRef:ElementRef,
   // private storage: AngularFireStorage, 
    private firestore: AngularFirestore,
    private firedatabase:AngularFireDatabase,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private socket:Socket,
    private route: ActivatedRoute,
    private router: Router) {
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
    //console.log(isBottom);
    if(isBottom){
      this.next();
    }
  }

  //=================== 資料庫---取得資料  ===========================================
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
      if((start==null && end ==null) || (start=='' && end =='')){
        return this.firestore.collection(obj.db).ref.where('order_uid','==', obj.uid).orderBy('created', 'desc');
      }else{
        return this.firestore.collection(obj.db).ref
        .where('order_uid','==', obj.uid)
        .where('created','>=', start_str + ' 00:00:00')
        .where('created','<=', end_str + ' 23:59:59')
        .orderBy('created', 'desc');
      }

      case("0"): case("1"):
        let m_status =1;//= parseInt(status);
        let condition;
        if(m_status==0){
          condition='!=';
        }else{
          condition='=='
        }
        if((start==null && end ==null) || (start=='' && end =='')){
          return this.firestore.collection(obj.db).ref.where('order_uid','==', obj.uid).where('cancel',condition, m_status).orderBy('created', 'desc');
        }else{
          return this.firestore.collection(obj.db).ref
          .where('order_uid','==', obj.uid)
          .where('cancel',condition, m_status)
          .where('created','>=', start_str + ' 00:00:00')
          .where('created','<=', end_str + ' 23:59:59')
          .orderBy('created', 'desc');
        }

     }
  }

  accesssAPI(obj, act?){
    let app =this;
    this.http.getByUid(obj, {
      success:function(data, mpageObj){
        if(data.length==0){
          app.pageObj.all = true; 
          app.list = data;
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



 //======================= 資料庫--上下頁比數 ===========================================================
 next(){
  //如果已經沒有資料了就不要再發 http request
  if(this.pageObj.all){
    return;
  }
  let obj= this.getReadObj();
  let selectedlef = this.getRef(obj); 
  let ref=  selectedlef.startAfter(this.pageObj.next).limit(obj.limit);
  obj.ref =ref;
  console.log("呼叫阿");
  this.accesssAPI(obj,'next');
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
  //======================= 其他 html  ====================================
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

  checkUpdatePay(){
    let error_count = this.checkCorrect();
    if(error_count>0){
      return;
    }
    var app = this;
    this.ogcatDialog.confirm("付款資訊填寫完即無法更改。請確認兩個欄位的填寫正確性。您確定要更新資訊?", {
      success:function(){
        app.updatePay();
      }
    })
  }

  updatePay(){
    let app =this;
    let item = this.searchItem;
    let pay_day = this.calendar.getStrYMDHMSbyObj(this.searchItem.pay_day);
    let updateObj={
      pay_day:pay_day,
      pay_number:item.pay_number
    }
    this.http.update(environment.db.store_order, item.id,updateObj, {
      success:function(data){
        app.searchItem.pay_day = app.calendar.getStrYMnoDashbyObj(app.searchItem.pay_day);
        app.searchItem.copy.pay_day= app.searchItem.pay_day ;
        app.searchItem.copy.pay_number = app.searchItem.pay_number;
        //發送 ws
        app.infoWallAdd( app.searchItem, 'P');
      }
    });
  }

  checkCorrect(){
    let error_count:number=0;
    let msg:string="";
    if(this.searchItem.pay_day == '' || this.searchItem.pay_number=='' ){
      msg ='[付款時間] 與 [付款碼] 兩個欄位都必須填寫';
      error_count++;
    }
    if(error_count>0){
      this.ogcatTool.showErrorMessage(msg);
    }
    return error_count;
  }

  goCancelOrder(){
    let app = this;
    let msg = `取消訂單即無法復原，您確定要取消此訂單? <span>請在以下輸入取消原因 (非必填)</span>`;
    let mobj={
      title:msg,
    }
    this.ogcatDialog.prompt(mobj,function(data){
      app.searchItem.cancel_remark = data;
      app.cancelOrder();
    });   
  }
  cancelOrder(){
    let app =this;
    let item = this.searchItem;
    let pay_day = this.calendar.getStrYMDHMSbyObj(this.searchItem.pay_day);
    let updateObj={
      cancel:1,
      cancel_uid:this.uid,
      cancel_remark: item.cancel_remark
    }
    this.http.update(environment.db.store_order, item.id,updateObj, {
      success:function(data){
        app.searchItem.copy.cancel= 1;
        app.searchItem.cancel =1;
        
        //發送 ws
        app.infoWallAdd( app.searchItem, 'C');
      }
    });
  }
  //================== 訊息牆相關  ============================================
   /**
    * 
    * @param searchItem 
    * @param act E/P/C  E:訂單 P:付款 C:取消訂單
    */ 
  infoWallAdd(searchItem, act){
    let app =this;
    let obj ={
      uid:searchItem.store_uid,
      ty:act,
      des:searchItem.id,
      r:0
    };
    this.http.create(environment.db.info_wall , obj, {
      success:function(data){
        obj['info_wall_id'] = data.id;
        obj['order_id'] = obj.des;
        app.socketObj.socketCancelUrl = environment.socketUrl.cancel + app.searchItem.store_uid+'/';
        app.socketObj.socketPayUrl =environment.socketUrl.pay + app.searchItem.store_uid+'/';
        app.socket.chooseSocket(obj, app.socketObj);
      }
    })
  }

//==================  websoket 相關  ============================================
  //app.socketPayUrl = 'order/'+ app.cInfo.uid+'/'; 
  socketAdd(url){
    this.firedatabase.database.ref(url).set({
      t: 0,
    });
  }

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


