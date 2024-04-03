import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';

import { OgcatTool, OgcatUser, OgcatDialog, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { environment } from '../../../environments/environment';
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-my-order-team',
  templateUrl: './my-order-team.component.html',
  styleUrls: ['./my-order-team.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar ]
})
export class MyOrderTeamComponent implements OnInit {
  uid;
    //儲存目前所點選那筆訂單的詳細資料
  searchItem={id:'', order_name:'', is_pay: null, created:'', updated:'',is_check:0, check_time:'', remark:'', end:'', title:'', list:[],
              order_uid: '', price: '', store_id: '', store_name: '', 
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
  socketPayUrl:string='pay/';
  socketCancelUrl:string='cancel/';
  params;

  constructor( 
    private elementRef:ElementRef,
    private firestore: AngularFirestore,
    private firedatabase:AngularFireDatabase,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private route: ActivatedRoute,
    private router: Router) {
      this.uid = this.tool1.getSessionUserInfo().uid;
      
    }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
    this.getList();
    
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
        return this.firestore.collection(obj.db).ref.where('order_uid','==', this.uid).orderBy('created', 'desc');
      }else{
        return this.firestore.collection(obj.db).ref
        .where('order_uid','==', this.uid)
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
          return this.firestore.collection(obj.db).ref.where('order_uid','==', this.uid).where('is_check',condition, m_status).orderBy('created', 'desc');
        }else{
          return this.firestore.collection(obj.db).ref
          .where('order_uid','==', obj.uid)
          .where('is_check',condition, m_status)
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
    let obj={ db: environment.db.team_order , order_uid:this.uid, limit:this.pageObj.page_count, ref:null }
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
  /*
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
  */
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

  //==================  其他 private  ============================================
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
