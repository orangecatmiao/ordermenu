import { Component, OnInit } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { UserAction } from './../../_factory/user-action/user-action';
import { Tool1 } from '../../_factory/tool1/tool1';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MessageService } from 'primeng/api';
import { Calendar } from '../../_factory/calendar';
import { ActionOffDay } from '../../_factory/action-off-day/action-off-day';
import { StoreFunc } from '../../_factory/store-func/store-func';
import { RandomFactory } from '../../_factory/random.factory';
import { Socket } from '../../_factory/socket/socket';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1, MessageService, Calendar, RandomFactory, Socket, UserAction, ActionOffDay, StoreFunc]
})
export class MenuComponent implements OnInit {
    title ="菜單顯示";
    params;
    db =  environment.db.menu;
    search_category='';
   
    menu_list:any=[];//菜單
    cart_list:any=[];
    team_order_list:any=[];
    price_list:any=[];
    category_list:any=[];//菜單類別
    category:string='';
   

    
    all_list=[];
    is_off_day;
    
    
    
    pay_number:string='';
    pay_day:string='';
    phone:string='';
    desc:string='';//送出訂單備註
    member={
      uid:'', name:'',
    }
    
    cInfo={ id:'', uid:'', store_name:''};
    addCartInfo;

    message_id:number =0;
    imageItem={name:'', img_full_url:''};
    locale;

    teamOrderInfo={
      id: "", order_name: "", end:"",  remark: "", store_anme: "",
      store_id: "", title: "", order_uid: ""
    };
    userInfo={ uid:'', displayName:'', email:'', emailVerified:false, photoURL:null };
    socketObj={
      socketOrderUrl :"",
      socketOrderPayUrl:"",
    }

    menuboardInfo={info:'', on:''};
    dataObj= {user_uid:'', store_id:'', store_name:'', id:'', is_favorite:false, store_info:null}
    uid;

  constructor(
    private calendar:Calendar,
    private firedatabase :AngularFireDatabase,
    private firestore: AngularFirestore,
    private ogcatTool:OgcatTool,
    private ogcatUser:OgcatUser,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private userAction:UserAction,
    private tool1:Tool1,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private storeFunc:StoreFunc,
    private actionOffDay:ActionOffDay,
    private randomFactory:RandomFactory,
    private socket:Socket
  ) { 
    
     let user = this.tool1.getSessionUserInfo();
     this.uid = user.uid;
     this.userInfo = user;
  }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
    this.route.params.subscribe(params => {
      this.params = params;
      if(params.id!=null && params.id!=""){
        this.setUserInfo();
        this.getInfo();
     
      }
      /** todo 團購相關 */
      if(params.team_order_id!=null){
        this.member.uid = localStorage.getItem("member_id"); 
        this.member.name =   localStorage.getItem("member_name");   
        if(this.member.name==null || this.member.name=='null'){this.member.name=""}
        if(this.member.uid==null){
          this.member.uid = this.randomFactory.getRandomUID(params.team_order_id);
          localStorage.setItem("member_id",  this.member.uid); 
        }
        //console.log("這是團購--"+params.team_order_id)
      }
   });
  }


  //======================= Emitter =======================================
  onGetTeamInfo(event){
    this.teamOrderInfo = event;
  }


  checkOrder(event){
    if(event.mtype=='check'){
        this.clearCategoryList();
        //發送 ws  
        //let orderData =event;
        //this.socketAddOrder(orderData.id);
        //this.infoWallAddOrderAct( orderData.id, 'E');
    }
  }


 //======================= ....Emitter =======================================
  setUserInfo(){
    let userInfo =this.tool1.getSessionUserInfo();
    this.userInfo =userInfo;
  }


  //================  資料庫-- 取得資料 =====================================
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
          app.getOffDay();
          app.getPrice();
          app.getMenuBoard();
          if(app.uid!=null && app.uid!=''){
            app.getFavorite();
          }
      }
    })
  }

  getOffDay(){
    let app =this;
    let obj ={
      db: environment.db.off_day,
      uid: this.cInfo.uid
    }
    
    this.http.getByUid(obj, {
      success:function(data){ 
          app.all_list = data;
          app.is_off_day = app.storeFunc.isOfffDay(app.all_list);
          console.log("假日否--"+app.is_off_day)
         // app.actionOffDay.separateListByType(app);
      }
    })
  }

  getPrice(){
    let app =this;
    let obj={ db:environment.db.price, uid: this.cInfo.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.price_list = data;
          app.getCategory();
      }
    });
  }
  
  //取得菜單類別
  getCategory(){
    let app =this;
    let obj={ db:environment.db.category, uid: this.cInfo.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.category_list = data;
          if(data.length>0){
            app.category = data[0].id;
            app.ogcatTool.reSortWeek(app.category_list, 'sort');
            app.getList();
          }
      }
    });
  }

  getList(){
    let app =this;
    let ref =  this.firestore.collection(this.db).ref.where('uid','==', this.cInfo.uid).where('on','==', true);
    let obj={ ref:ref }
    this.http.getByUid(obj ,{
      success:function(data){
          app.menu_list = data;
          app.ogcatTool.reSortWeek(app.menu_list, 'sort');
          app.setStoreImageUrl();
          app.categoryProduct();
          app.setPriceNameToList();
      }
    });
  }

  getMenuBoard(){
    let app =this;
    let obj={
      db:environment.db.menu_board,
      uid:this.cInfo.uid
    }
    this.http.getByUid(obj, {
      success: function(data){
        if(data.length>0){
          app.menuboardInfo = data[0];
        }
      } 
    })
  }

 //=================== 資料庫--取得資料後續相關 ==================================
  categoryProduct(){
    let app =this;
    this.menu_list.forEach(function(val){
      val.quantity =1;
      app.category_list.forEach(function(cate_val){
        if(cate_val.list == null){
          cate_val.list = [];
        }
        if(val.category == cate_val.id){
          cate_val.list.push(val);
        }
      })
    });
      // app.reSortWeek(app.menu_list); 
    //console.log("整理過後的類別項目",this.category_list)
  }

  //全部設定圖片網址
  setStoreImageUrl(){
    this.menu_list.forEach(function(val){
      if(val.img_token!=''){
        let url = environment.firebase.imgserve+ 
        environment.firebase.storageBucket +
        '/o/'+ val.uid +'%2f'+ 
        val.img_name +'?alt=media&token='+ 
        val.img_token;
        
        val.img_full_url = url;
      }
    });
  }

 //=================== 資料庫--建立訂單---新增/修改/刪除 ==================================

  createOrder(){
    this.setUserInfo();
   
    let addObj={
      price: this.getTotalPrice(),
      store_uid:this.cInfo.uid,
      order_name:this.userInfo.displayName,
      order_uid: this.userInfo.uid,
      cancel_uid: '',
      remark:this.desc,
      phone:this.phone,
      store_remark:'',
      pay_day: this.calendar.getStrYMDHMSbyObj(this.pay_day),
      pay_number:this.pay_number,
      is_pay:0,
      cancel:0,
    };
    
    let app= this;
    this.http.create(environment.db.store_order, addObj, {
      success:function(data){
        app.createOrderDetail(data);
      }
    })
  }

  createOrderDetail(orderData){
    this.resetCartList(orderData.id);
    let add_list = this.getAddList();
    let app =this;
 
    this.http.createMultiple(environment.db.store_order_detail, add_list, {
      success:function(data){
        app.cart_list=[];
        app.clearCategoryList();
        app.closeCartModal();
        //發送 ws
        if(app.pay_day!=null && app.pay_day!='' && app.pay_number!=null && app.pay_number!=''  ){
           app.infoWallAddOrderAct(  orderData.id, 'PE');
         }else{
           app.infoWallAddOrderAct(  orderData.id, 'E');
         }
      }
    })
  }

  resetCartList(ID){
    this.cart_list.forEach(function(val){
        val.order_id = ID;
    })
  }

  getAddList(){
    let add_list=[];
    this.cart_list.forEach(function(val){
        let aObj= JSON.parse(JSON.stringify(val));
        delete aObj.copy;
        delete aObj.created;
        delete aObj.updated;
        delete aObj.img_full_url;
        delete aObj.price_list;
        delete aObj.uid;
        delete aObj.img_name;
        delete aObj.img_token;
        delete aObj.m_code;
        add_list.push(aObj);
     });
     return add_list;
  }

 //================== 訊息牆相關  ============================================
 /**
  * 
  * @param order_id 
  * @param act E/P/C  E:訂單 P:付款 C:取消訂單
  */ 
  infoWallAddOrderAct(order_id:string, act){
    let app =this;
    let obj ={
      uid:this.cInfo.uid,
      ty:act,
      des:order_id,
      r:0
    };
    this.http.create(environment.db.info_wall , obj, {
      success:function(data){
        obj['info_wall_id'] = data.id;
        obj['order_id'] = obj.des;
        app.socket.chooseSocket(obj, app.socketObj);
      }
    })
  }

  //==================  websoket 相關  ============================================
  

 //=================== Html 動作與頁面使用 ==================================
  changeQuantity(act, xitem){
    switch(act){
      case('+'):
        xitem.quantity++;
      break;

      case('-'):
        if(xitem.quantity<=1){
          return;
        }
        xitem.quantity--;
      break;
    }
  }

  addToCart(xitem){
    if(xitem.price=='' && xitem.price_obj==null){
      this.ogcatTool.showErrorMessage("請選擇商品規格");
      return;
    }else if(xitem.quantity<1){
      this.ogcatTool.showErrorMessage("數量不能小於1");
      return;
    }else if(xitem.quantity%1 !=0){
      this.ogcatTool.showErrorMessage("數量只能是整數");
      return;
    }
    this.addCartInfo =xitem;
    this.addMessage(xitem);
    let repeat=0;
    this.cart_list.forEach(function(val){
      if(val.id == xitem.id){
        val.quantity++;
        repeat++;
      }
    });

    if(repeat>0){
      xitem.price_obj=null;
      this.cartAnimated();
      return;
    }

    let newItem =JSON.parse(JSON.stringify(xitem));
    this.cart_list.push(newItem);
    xitem.price_obj=null;
    this.cartAnimated();
  }

  cartAnimated(){
    let dom='';
    if(this.params.team_order_id==null){
      dom='.store-order';
    }else{
      dom='.team-member';
    }
    $(dom).addClass('animated bounceIn ');//rubberBand
    setTimeout(function(){
      $(dom).removeClass('animated bounceIn');
    },500)
  }

  addMessage(xitem) {
    // this.messageService.add({key: 'c', sticky: true, severity:'success' });
   
    let app =this;
    this.messageService.add({ sticky: true,  severity:'success',summary:'加入'+xitem.name, detail:  xitem.name + '已加入!' });
    setTimeout(function(){
      app.messageService.clear();
    },3000)
  }

  getTotalPrice(){
    let price =0;
    this.cart_list.forEach(function(val){
      if(val.price_obj!=null){
        price += val.price_obj.price;
      }else{
        price += val.price;
      }
    });
    return price;
  }

  openCartModal(){
    $('#cartModal').modal('show');
  }

  closeCartModal(){
    $('#cartModal').modal('hide');
  }

  goCheckOrder(){
    //var MobileReg = /^(09)[0-9]{8}$/;
    //let mphone ='09'+this.phone;
    if(this.cart_list.length==0){
      this.ogcatTool.showErrorMessage("購物車無任何商品");
      return;
    }else if(this.phone == ''){
      this.ogcatTool.showErrorMessage("請輸入連絡電話方便店家聯絡");
      return;
    }

    let isok = this.tool1.checkPayInfo(this.pay_day, this.pay_number);
    if(!isok){
      this.ogcatTool.showErrorMessage("[付款日期] 與 [付款號碼] 必須同時填或不填 ");
      return;
    }

    let is_show_login = this.tool1.isShowLogin();
    if(is_show_login){
      return;
    }

    let app =this;
    this.ogcatDialog.confirm("確認後將會送給店家成立訂單，但必須由店家確認後才能確定訂單有效，確定要成立訂單?",{
     success:function(){
        app.createOrder();
     }
    })
  }

  openImageModal(xitem){
    this.imageItem = JSON.parse(JSON.stringify(xitem));
    $('#imageModal').modal('show');
  }

  closeImageModal(){
    $('#imageModal').modal('hide');
  }

  /**
   * 移除購物車裡面的商品
   * @param item 
   */
  removeCart(item){
    let app =this;
    this.cart_list.forEach(function(val){
      if(val.id == item.id){
        app.cart_list = app.ogcatTool.deleteArrayByID(app.cart_list, item.id , 'id');
      }
    });
  }

  getCartNum(){
    let quantity =0;
    this.cart_list.forEach(function(val){
      quantity+=val.quantity;
    });
    return quantity;
  }

  //========================== 團購 ==========================================
  goCheckTeamOrderDetail(){
   /*
    let app =this;
    this.ogcatDialog.confirm("確認送出您的訂購給團購負責人?",{
     success:function(){
        app.createTeamOrderDetail();
     }
    })
   */
  this.createTeamOrderDetail();
  }

  createTeamOrderDetail(){
    if(this.member.name==''){
      this.ogcatTool.showErrorMessage("請輸入訂購人姓名");
      return;
    }

    this.resetCartList(this.params.team_order_id);
    let add_list = this.getAddList();
    this.getTeamOrderDetailList(add_list);
    let app =this;

    this.http.createMultiple(environment.db.team_order_detail, add_list, {
      success:function(data){
        app.cart_list=[];
        app.clearCategoryList();
        app.closeCartModal();
        localStorage.setItem("member_name", app.member.name);   
      }
    })
  }

  getTeamOrderDetailList(add_list){
    let app =this;
    add_list.forEach(function(val){
        val.order_uid = app.member.uid;
        val.order_name = app.member.name;
        val.c_code = app.teamOrderInfo.order_uid;
        val.is_pay=0;
    });
  }

  //========================== 額外動作 ==========================================
   //送出訂單後，清空規格選擇
  clearCategoryList(){
      this.category_list.forEach(function(val){
        val.list.forEach(function(mval){
           if(mval.price_obj!=null){
              mval.price_obj=null;
           }
        })
      });
      this.desc='';
  }

   //將 price_name 值指定給 list 裡每個值
  setPriceNameToList(){
    let app= this;
    this.menu_list.forEach(function(val){
       if(val.price_list==null){
        val.price_list =[];
       }
       if(val.price_list.length >0){
        val.price_list.forEach(function(pval){
          app.price_list.forEach(function(price_val){
            if(pval.price_id === price_val.id){  
              pval.price_name = price_val.price_name;
            }
          });  
        });
       }
    })
  }

//========================== 取得最愛相關 ==========================================
  getFavorite(){
    this.dataObj ={
     user_uid : this.uid, 
     store_id: this.cInfo.id, 
     store_name: this.cInfo.store_name, 
     id:'', 
     is_favorite:false, 
     store_info:null
    }
   this.userAction. getFavorite(this.dataObj);
 }
 
 favorite(){
   this.userAction.favorite(this.dataObj);
 }

}
