import { Component, OnInit, ChangeDetectorRef, ElementRef  } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatDataServices, OgcatUser, OgcatTool  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Msub1 } from '../../_data-services/msub1';
import { Subscription } from 'rxjs';
import { Router }from '@angular/router';
import { Firehttp } from '../../_service/firehttp'

import { environment } from 'src/environments/environment';
import { Tool1 } from '../../_factory/tool1/tool1'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers:[OgcatUser, OgcatTool, Firehttp, Tool1]
})
export class HeaderComponent implements OnInit {
  
  userInfo;
  storeInfo={id:'', uid:'', store_name:'', description:'', img_token:''};
  info_wall_list=[];
  is_show_info_wall = false;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  uid;
  bells_list=[];
  bells=0;
  init_socket=0;
  init_socket2=0;
  init_socket3=0;
  init_socket4=0;
  init_socket5=0;

  pageObj={
    all:false,
    page_count:20,//每頁顯示幾筆
    next:{},
    prev:{}
  }

  socket_orderpay=[];
  socket_order=[];
  socket_pay=[];
  socket_cancel=[];
  socket_checkpay=[];

  constructor(
    private auth:AngularFireAuth, 
    private firedatabase:AngularFireDatabase,
    private firestore: AngularFirestore,
    private ds: OgcatDataServices,
    private msub1 :Msub1,
    private ogcatTool:OgcatTool,
    private ogcatUser:OgcatUser,
    private ref: ChangeDetectorRef,
    private elementRef:ElementRef,
    private router:Router,
    private http:Firehttp,
    private tool1:Tool1,
    public translate: TranslateService
    ){ 
        this.subscription1 = this.ds.getUser().subscribe(x => { this.userInfo = x; });
        this.subscription2 = this.msub1.getShowInfoWall().subscribe(x => {this.is_show_info_wall = x; });
        this.subscription3 = this.msub1.getStoreInfo().subscribe(x => {this.storeInfo = x;  this.ref.detectChanges(); });

        this.initLanguage();
    }
  /**
   * Component 動作
   * 1.取得使用者資訊。 -->getCurrentUser();
   * 2.取得完使用者資訊，取得商店資訊。--> getStoreInfo()
   * 3.如果有建立商店，則  (1).取得訊息牆訊息--> app.getInfoWall(); (2).建立 websocket --> app.listenOrder();
   * 4.(2)
   */



  ngOnInit(): void {
    let user = this.tool1.getSessionUserInfo();
    this.uid = user.uid;
    this.initUserInfo();
    this.getCurrentUser();
    Notification.requestPermission(function(result) {});
   
  }

  initLanguage(){
    var lang = sessionStorage.getItem('language');
    if(lang==null ||  lang==""){
      lang =navigator.language.toLowerCase() ;
    }
    this.translate.addLangs(["en", "zh-tw","jp"]);
    this.translate.setDefaultLang(lang);

    let browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|zh-tw/) ? browserLang : lang);
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('.info-wall').addEventListener('scroll', this.onScroll.bind(this));
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

  setCInfo(data){
    this.storeInfo = data;
    this.storeInfo['id'] = data.id;
  }

  
  initUserInfo(){
    this.userInfo={uid:null};
  }

  
  //=================== 資料庫--使用者資訊 ===================================================
  //取得登入者資訊
  getCurrentUser(){
    let app =this;
    this.auth.onAuthStateChanged(function(user) {
      if (user) {
        let userInfo = app.ogcatUser.setUserInfo(user);
        app.userInfo = userInfo;
        app.getMemberInfo();
        app.getStoreInfo(); 
      } else {
        app.clearLocalStorage();
        // No user is signed in.
      }
    });
  }
  //=================== 資料庫--使用者資訊 member-info ==========================================
  getMemberInfo(){
    let app =this;
    let obj={ db:environment.db.member_info, uid:this.userInfo.uid, show:false }
    this.http.getByUid(obj, {
      success:function(data){ 
        if(data.length>0){
          data = data[0];
          app. setStorage(data);
          //S: store / U:user
          app.getInfoWall(); // 取得訊息牆的訊息
          if(data.user_type==='S'){
            app.listenOrderPay();
            app.listenOrder();  //websocket 連線---listenOrder();
            app.listenPay();
          }else if(data.user_type==='U'){
            app.listenCheckPay();
          }
          app.listenCancel();
        }else{
        //  setTimeout(function(){app.ref.detectChanges();},30)
        //  setTimeout(function(){app.ref.detectChanges();},3000)
        }
      },
      error:function(error){
        
      }
    })
  }

  setStorage(data){
    this.userInfo.user_type = data.user_type;
    localStorage.setItem('user_type',data.user_type); 
  }

  //=================== 資料庫--使用者商店 store-info ==========================================
  //取得商店資訊  
  getStoreInfo(){
    let app =this;
    let obj={ db:environment.db.store_info, uid:this.userInfo.uid, show:false }
    this.http.getByUid(obj, {
      success:function(data){ 
        if(data.length>0){
          app.setCInfo(data[0]);
        /**
          app.getInfoWall(); 
          app.listenOrder(); 
          app.listenPay();
          app.listenCancel();
          app.listenCheckPay();
         */
        }else{
        //  setTimeout(function(){app.ref.detectChanges();},30)
        //  setTimeout(function(){app.ref.detectChanges();},3000)
        }
      },
      error:function(error){
        
      }
    })
  } 
  
  //=================== 資料庫--訊息牆 info-wall ==============================================
  //資料庫--更新已讀取
  updateRead(item){
    if(item.r==1){
      return
    }
    item.r =1;
    let updateObj={r:1, show:0}
    this.http.update(environment.db.info_wall, item.id, updateObj, {
      success:function(){}
    })
  }

  next(){
    //如果已經沒有資料了就不要再發 http request
    if(this.pageObj.all){
      return;
    }
    let obj={ref:null, show:false}
    obj.ref = this.firestore.collection(environment.db.info_wall).ref
    .where('uid','==', this.userInfo.uid )
    .orderBy('created', 'desc')
    .startAfter(this.pageObj.next)
    .limit(this.pageObj.page_count);
    this.accesssAPI(obj);
  }


  //訊息牆--取得資料庫的訊息
  getInfoWall(){
    let obj={ref:null, show:false}
    
    obj.ref = this.firestore.collection(environment.db.info_wall).ref
    .where('uid','==', this.userInfo.uid )
    .orderBy('created', 'desc')
    .limit(this.pageObj.page_count);
    this.accesssAPI(obj);
  }

  accesssAPI(obj){
    let app =this;
    this.http.getByUid(obj, {
      success:function(data, mpageObj){
        if(data.length==0){
          app.pageObj.all = true; 
        }else{
          if(app.info_wall_list.length===0){
            app.info_wall_list = data;
          }else{
            app.info_wall_list = app.info_wall_list.concat(data);
          }
          // console.log(data)
          app.setPageObj(mpageObj);
          setTimeout(function(){app.ref.detectChanges();},30);
          setTimeout(function(){app.ref.detectChanges();},3000);
        }
      },
      error:function(error){
      }
    })
  }



  //資料庫取得--依照帳單編號取得帳單資訊，並填入 info-wall-list 中
  getNewToInfoWallList(order_id){
    //取 info wall id
    let app = this;
    let infowall_id = order_id; //snapObj[Object.keys(snapObj)[Object.keys(snapObj).length -1]].t;
    let obj ={
      db:environment.db.info_wall,
      id:infowall_id,
      show:false
    }

    this.http.getByID(obj, {
        success: function(data){
          if(data && data.id !=null && data.id !='' ){
            app.info_wall_list.unshift(data);
            setTimeout(function(){app.ref.detectChanges();},30)
          }   
        }
    });
    
  }

  setPageObj(mpageObj){
    this.pageObj.prev = mpageObj.prev;
    this.pageObj.next = mpageObj.next;
  }
  //==================================================  websocket 連線與CRUD  =======================================================
  listenOrderPay(){
    let app =this;
    let socket_arr_name= 'socket_orderpay';
    let root = this.firedatabase.database.ref( environment.socketUrl.order_pay + this.uid ) 
    root.on('value', function(snap){
        let order_key= app.getNewInfoIDbySocket(socket_arr_name, snap.val());
        let msgObj={
          title:'[已付款]-您有一筆新訂單', body:'訂單編號'+ order_key, tag:order_key, url:'/store/customer-order/'+ order_key
        }
        app.getSocketDo(snap,'init_socket5', socket_arr_name, msgObj);
   });
  }

  listenOrder(){
    let app =this;
    let socket_arr_name= 'socket_order';
    let root = this.firedatabase.database.ref( environment.socketUrl.order + this.uid )
    root.on('value', function(snap){
        let order_key= app.getNewInfoIDbySocket(socket_arr_name, snap.val());
        let msgObj={
          title:'您有一筆新訂單', body:'訂單編號'+ order_key, tag:order_key, url:'/store/customer-order/'+ order_key
        }
        app.getSocketDo(snap,'init_socket', socket_arr_name, msgObj);
   });
  }

  listenPay(){
    let app =this;
    let socket_arr_name= 'socket_pay';
    let root = this.firedatabase.database.ref( environment.socketUrl.pay + this.uid )
    root.on('value', function(snap){
        let order_key= app.getNewInfoIDbySocket(socket_arr_name, snap.val());
        let msgObj={
          title:'一筆新的付款', body:'訂單編號'+ order_key, tag: order_key, url:'/store/customer-order/'+ order_key
        }
        app.getSocketDo(snap,'init_socket2', socket_arr_name, msgObj);
    });
  }

  listenCancel(){
    let app =this;
    let socket_arr_name= 'socket_cancel';
    let root = this.firedatabase.database.ref(environment.socketUrl.cancel + this.uid )
    root.on('value', function(snap){
        let order_key= app.getNewInfoIDbySocket(socket_arr_name, snap.val());
        let link_url;
        if(app.userInfo.user_type=='U'){
          link_url = '/member/my-order/' + order_key;
        }else{
          link_url = '/store/customer-order/'+ order_key;
        }
        let msgObj={
          title:'訂單取消通知', body:'訂單編號'+ order_key, tag: order_key, url:link_url
        }
        app.getSocketDo(snap,'init_socket3', socket_arr_name, msgObj);
    });
  }


  listenCheckPay(){
    let app =this;
    let socket_arr_name= 'socket_checkpay';
    let root = this.firedatabase.database.ref( environment.socketUrl.check_pay+ this.uid )
    root.on('value', function(snap){
        let order_key= app.getNewInfoIDbySocket(socket_arr_name, snap.val());
        
        let msgObj={
          title:'您的訂單已成立!', body:'訂單編號'+ order_key, tag: order_key, url:'/member/my-order/'+ order_key
        }
        app.getSocketDo(snap,'init_socket4',socket_arr_name, msgObj);
    });
  }

  notifiy(msgObj){
      Notification.requestPermission(function(result) {
        if (result === 'granted') {
          navigator.serviceWorker.ready.then(function(registration) {
              registration.showNotification(msgObj.title, {
                body:msgObj.body,
                tag: msgObj.tag, //要不一樣才會出現
                renotify: true,
                data: { 
                  url : msgObj.url //點擊推播通知打開的頁面
                } 
                //silent: true 如果通知不須用戶立即關注即可使用此選擇
              });
            });
        }
      });
  }
 

  

  getSocketDo(snap,socket_name, socket_arr_name, msgObj){
    let app =this;
    app[socket_name]++;

    if(snap.val() != null){
      // console.log("訂單資訊",Object.keys(snap.val()) )
       if(app[socket_name]==1){//初始化
         //1. 計算筆數。為鈴鐺數目
         app.initSocketList(socket_arr_name , snap.val());
         for(let key in snap.val()){
           app.bells_list.push(key)
         }
       }else{
         //取得這一筆 WS 的 info-wall 資訊
         app.bells_list.push(msgObj.tag);
         app.getNewToInfoWallList(msgObj.tag); 
         app.notifiy(msgObj);
       }
      
       app.bells = app.bells_list.length;
       if(app.bells>0){
         document.getElementById("bells").innerHTML= environment.pagetitle + " (" + app.bells +")";
         setTimeout(function(){app.ref.detectChanges();},30)
       }
    } 
  }

  isShowInfoWall(event){
    event.stopPropagation();
    this.is_show_info_wall=! this.is_show_info_wall;
    
    if(this.is_show_info_wall == true  && this.bells_list.length!=0){
      this.bells_list =[]; // 鈴鐺訊息表歸 0
      this.bells=0; //鈴鐺數量歸 0
      //刪除所有的 realtime db ----order/stor_id 
      this.firedatabase.database.ref(environment.socketUrl.order_pay + this.userInfo.uid ).remove();
      this.firedatabase.database.ref(environment.socketUrl.order + this.userInfo.uid ).remove();
      this.firedatabase.database.ref(environment.socketUrl.pay+ this.userInfo.uid ).remove();
      this.firedatabase.database.ref(environment.socketUrl.cancel + this.userInfo.uid ).remove();
      this.firedatabase.database.ref(environment.socketUrl.check_pay+ this.userInfo.uid ).remove();
      
      document.getElementById("bells").innerHTML= environment.pagetitle;
    }
  }


  initSocketList(socket_arr_name , snap_list){
    this[socket_arr_name] =  Object.entries(snap_list);
  }

  getNewInfoIDbySocket(socket_arr_name, snap_list){
      if(snap_list==null){
        return
      }
     let app =this;  
     let s_list = Object.entries(snap_list);
     s_list.forEach(function(val){
       app[socket_arr_name].forEach(function(sval){
          if(val[0] === sval[0]){
            val['have'] = true;
          }
       });
     });

    
     let order_id;
     s_list.forEach(function(val){
      if(val['have']!=true){
        order_id = val[0];
        app[socket_arr_name].push(val);
      }
     });
     return order_id;
  }

  //================================================  登出  ====================================================================
  logout(){
    let app =this;
    this.auth.signOut().then(function() {
      setTimeout(function(){app.ogcatTool.showMessage("您已登出!");},300)
      app.initUserInfo();
      app.clearLocalStorage();
      app.ref.detectChanges();
      app.router.navigate(['/user/login']);
    }).catch(function(error) {
      // An error happened.
    });
  }

  clearLocalStorage(){
    let member_id = localStorage.getItem("member_id");
    let member_name = localStorage.getItem("member_name");
    localStorage.clear();
    localStorage.setItem("member_id",member_id);
    localStorage.setItem("member_name",member_name);
  }


 
  
}




//var result = Object.keys(snap.val()).map((key) => snap.val()[key]);