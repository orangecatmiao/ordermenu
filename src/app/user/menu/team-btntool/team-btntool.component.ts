import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../../_service/firehttp';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { Calendar } from '../../../_factory/calendar';
import { Tool1 } from '../../../_factory/tool1/tool1';
import { Socket } from '../../../_factory/socket/socket';

@Component({
  selector: 'app-team-btntool',
  templateUrl: './team-btntool.component.html',
  styleUrls: ['./team-btntool.component.scss'],
  providers:[Firehttp, OgcatDialog, OgcatTool, Calendar, Tool1, Socket]
})
export class TeamBtntoolComponent implements OnInit {

  pay_number:string='';
  pay_day:string='';
  phone:string='';
  desc:string='';
  locale;
  //team_order_list:Array<any>=[];
  team_order_total_price:number=0;
  
  @Input('socketObj')  socketObj={
    socketOrderUrl :"",
    socketOrderPayUrl:"",
  }
  @Input('isModal') isModal:boolean=true;
  @Input('team_order_list') team_order_list=[];
  @Input('cInfo') cInfo={ id:'', uid:'', store_name:''};
  @Input('cart_list') cart_list:Array<any>;
  @Input('userInfo') userInfo = {uid:'', displayName:''}; 
  @Input('params') params ; 
  @Input('teamOrderInfo') teamOrderInfo={
    id: "", order_name: "", end:"",  remark: "", store_anme: "",is_check:0,
    store_id: "", title: "", order_uid: ""
  };
  @Output() voted = new EventEmitter<boolean>();

  constructor(
    private http: Firehttp,
    private firestore: AngularFirestore,
    private ogcatDialog:OgcatDialog,
    private ogcatTool:OgcatTool,
    private calendar:Calendar,
    private tool1:Tool1,
    private socket:Socket
  ) { 
    this.locale = this.calendar.localize();
  }

  ngOnInit(): void {
  }


  openTeamOrderListModal(){
    $('#teamOrderListModal').modal('show');
  }

  closeTeamOrderListModal(){
    $('#teamOrderListModal').modal('hide');
  }


  getTeamOrderDetail(){
    let app =this;
    let obj ={
      db:environment.db.team_order_detail,
      id:this.params.team_order_id,
      ref:null
    }
    obj.ref =  this.firestore.collection(obj.db).ref.where('order_id','==', this.params.team_order_id);
    this.http.getByUid(obj, {
      success:function(data){
        if(data.length>0){
          app.team_order_list = data;
        }
        app.openTeamOrderListModal();
        app.getTotalTeamOrderPrice();
      }
    })
  }

  //確認是否將團購轉訂單
  goCheckTeamToOrder(){
    if(this.team_order_list.length==0){
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
        app.createTeamToOrder();
     }
    })
  }

  //將團購轉訂單
  createTeamToOrder(){
    this.setUserInfo();
    
    let addObj={
      price: this.team_order_total_price,
      store_uid:this.cInfo.uid,
      order_name:this.userInfo.displayName,
      order_uid: this.userInfo.uid,
      cancel_uid: '',
      phone:this.phone,
      remark:this.desc,
      store_remark:'',
      pay_day: this.calendar.getStrYMDHMSbyObj(this.pay_day),
      pay_number:this.pay_number,
      is_pay:0,
      cancel:0,
    };
    
    let app= this;
    this.http.create(environment.db.store_order, addObj, {
      success:function(data){
        app.createTeamToOrderDetail(data);
      }
    })
  }

  //寫入訂單詳細資訊
  createTeamToOrderDetail(orderData){
    let add_list = this.getAddList();
    this.resetCartList(add_list, orderData.id);//重設 order_id (原本為 team_order 的，現在改為 store_order)
    let app =this;
    
    this.http.createMultiple(environment.db.store_order_detail, add_list, {
      success:function(data){
        app.cart_list=[];
        orderData.mtype="check";
        app.voted.emit(orderData);
        app.closeTeamOrderListModal();
        app.okTeamOrder();
         //發送 ws
         if(app.pay_day!=null && app.pay_day!='' && app.pay_number!=null && app.pay_number!=''  ){
          app.infoWallAddOrderAct(  orderData.id, 'PE');
        }else{
          app.infoWallAddOrderAct(  orderData.id, 'E');
        }
      }
    })
  }
  getAddList(){
    let add_list=[];
    this.team_order_list.forEach(function(val){
        let aObj= JSON.parse(JSON.stringify(val));
        delete aObj.copy;
        delete aObj.created;
        delete aObj.updated;
        delete aObj.img_full_url;
        delete aObj.price_list;
        delete aObj.uid;
        delete aObj.img_name;
        delete aObj.img_token;
      
        add_list.push(aObj);
     });
     return add_list;
  }

  //將 team-order 結單 ---> check 欄位改 1  
  okTeamOrder(){
    let app =this;
    let updateObj={
      is_check:1,
      check_time:this.calendar.getStrYMDHMSbyObj(new Date()),
    };
    this.http.update(environment.db.team_order, this.params.team_order_id, updateObj, {
      success:function(data){
        app.teamOrderInfo.is_check=1;
      }
    });
  }


  deleteTeamOrderDetail(item){
    let app =this;
    this.http.delete(environment.db.team_order_detail, item.id, {
      success: function(data){
        app.team_order_list = app.ogcatTool.deleteArrayByID(app.team_order_list, item.id , 'id');
      }
    })
  }


  resetCartList(add_list, ID){
    add_list.forEach(function(val){
        val.order_id = ID;
    })
  }

  setUserInfo(){
    let userInfo =this.tool1.getSessionUserInfo();
    this.userInfo =userInfo;
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

  //======================= html ================================
  goDeleteTeamOrderDetail(item){
    let app =this;
    this.ogcatDialog.confirm("刪除後無法復原，只能重新新增，確定要刪除商品?",{
     success:function(){
        app.deleteTeamOrderDetail(item);
     }
    })
  }

  getTotalTeamOrderPrice(){
    let price =0;
    this.team_order_list.forEach(function(val){
      if(val.price_obj!=null){
        price += val.price_obj.price*val.quantity;
      }else{
        price += val.price*val.quantity;
      }
    });
    this.team_order_total_price =  price;
  }

  //不出現 modal 的狀況
  checkCreateOrder(){
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
    this.ogcatDialog.confirm("送出訂單後必須付款後才經由商店確認才成立。確定要送出訂單?",{
     success:function(){
      app.team_order_list = JSON.parse(JSON.stringify(app.cart_list));
      app.createTeamToOrder();
     }
    });
  }



}
