import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener  } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OgcatDialog, OgcatTool } from '../../../../../projects/ogcat-tool-package/src/public-api';
import { Tool1 } from '../../../_factory/tool1/tool1';
import { RandomFactory } from 'src/app/_factory/random.factory';
//import { DataService } from 'src/app/dataService/data.service';
import { Firehttp } from 'src/app/_service/firehttp';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.scss'],
  providers:[OgcatDialog, OgcatTool, RandomFactory, Tool1]
})
export class TeamMemberComponent implements OnInit {
  title = '訂單列表-團員';  //mobile500:boolean = false;

  err_msg:string='';
  nick:string='';
  nick_info:string='';
  
  is_nick:boolean = false;
  is_check:number = 0; //此訂單是否已結單
  
  addObj ={ 
    id:'',  m_code:'', c_code:'', name: localStorage.getItem("order_name"), product:'',  quantity:null,  uid:'',
    price:null, count:null, remark:'', is_edit:false
  }

  editObj ={ 
    id:'', m_code:'',c_code:'',  name:'', order_name:'',  quantity:null, price_obj:{price:0},
    price:null, count:null, remark:''
  }

  subscription1: Subscription;
  uid:string='';
  member={uid:'', name:''};
  params;

  @Input() titleInfo ={ id:'', title:'',order_name:'', store_name:'', end:'', is_check:0, remark:'',created:'' };
  @Input() mcode:string ='';
  @Input() ccode:string ='';
  @Input() order_list =[];
  @Input() charge:boolean= false;
  @Input() is_total;
  @Output() voted = new EventEmitter<boolean>();

  constructor(
    private elementRef:ElementRef,
    private ogcatDialog: OgcatDialog,
    private ogcatTool: OgcatTool,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private randomFactory:RandomFactory,
    private http:Firehttp,
    private tool1:Tool1,
    private firestore: AngularFirestore,
  ) { }
  @HostListener('window:resize', ['$event.target']) 

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.params =params;
      this.isLogin();
      
      if(params.id!=null || params.team_order_id!=''){
      }
    
    });
  }
  ngOnChanges(){
    if(this.titleInfo.store_name!=''){
        this.is_check = this.titleInfo.is_check;
    }
    this.reSetPopover(500);
  }

  onResize() { 
    this.reSetEditing();
  }
  
  goVote(obj) {
    this.voted.emit(obj);
  }

  showTotal(){
    this.goVote({is_total:true});
  }

  isLogin(){
    let userID = localStorage.getItem("member_id");
    this.uid = this.member.uid =  userID;
    if(userID==null){
      this.uid=this.randomFactory.getRandomUID(this.params.team_order_id);
      localStorage.setItem("member_id",this.uid);
      this.addObj.uid = this.uid;
    }
  }

  checkForm(obj){
    let error=0;
    if(obj.quantity ==null || obj.quantity === ''){
      this.translate.get('MEMBER_LIST.MSG_PRODUCT_QUANTITY').subscribe((errMsg) => {
        this.err_msg = errMsg;
        this.ogcatTool.showErrorMessage(errMsg);
        error++;
      });
    }else if(isNaN(obj.quantity)){
      this.translate.get('MEMBER_LIST.MSG_PRODUCT_QUANTITY_NUMBER_ONLY').subscribe((errMsg) => {
        this.err_msg = errMsg;
        this.ogcatTool.showErrorMessage(errMsg);
        error++;
        
      });
    }else if(obj.quantity<=0){
      this.ogcatTool.showErrorMessage("數量不能小於0");
      error++;
    }

    if(error>0){
      return false;
    }

    return true;
  }
//============================================ 資料庫API ==============================================================


  goEditOrder(item){
    let is_edit = false;
    if(window.innerWidth>700){
      is_edit = this.isEditing();
    }
    if(is_edit){
      this.ogcatTool.showErrorMessage("您目前正在修改其他項目");
      return;
    }
   
    this.editObj = JSON.parse(JSON.stringify(item));
    item.is_edit = true;
  }
  
  checkEditOrder(){
    let editObj = this.editObj;
    let is_ok = this.checkForm(editObj);
    if(is_ok){
      this.editOrder();
    }
  }

  reSetEditing(){
    this.order_list.forEach(function(val){
       val.is_edit=false;
    });
  }

  isEditing(){
    let is_edit =0;
    this.order_list.forEach(function(val){
      if(val.is_edit){
        is_edit++;
      }
    });
    if(is_edit>0){
      return true;
    }
    return false;
  }

  //todo 只能改數量
  editOrder(){
    let app = this;
    let eObj ={
      id:this.editObj.id,
      quantity:parseInt(this.editObj.quantity),
      remark:this.editObj.remark
    }
    this.http.update(environment.db.team_order_detail, eObj.id, eObj, {
      success: function(data){
        app.order_list.forEach(function(val, key){
          if(val.id == app.editObj.id){
            app.order_list[key] = app.editObj;
          }
        });
        app.reSetPopover(500);
        $("#editModal").modal("hide");
      }
    });
  }

  goCancelOrder(sItem){
  
    let app = this;
    if(sItem.remark==null){ sItem.remark='' }

    let m_price=0;
    if(sItem.price_obj!=null){
      m_price = sItem.price_obj.price;
    }else{
      m_price = sItem.price;
    }

    let ori_arr=['MEMBER_LIST.MSG_CONFIRM_CANCEL','MEMBER_LIST.ORDERER','MEMBER_LIST.PRODUCT_NAME','MEMBER_LIST.PRODUCT_PRICE','MEMBER_LIST.PRODUCT_QUANTITY','REMARK'];
    let t_arr = this.tool1.getTransNameArr(ori_arr);
    let obj={//"取消後無法復原，您確定要取消訂單?"
      message: t_arr['MEMBER_LIST.MSG_CONFIRM_CANCEL']+
      `
      <br/>
      <table class="table table-bordered">
        <tr class="table-primary">
          <td>`+ t_arr['MEMBER_LIST.ORDERER'] +`</td>
          <td>`+ t_arr['MEMBER_LIST.PRODUCT_NAME'] +`</td>
          <td>`+ t_arr['MEMBER_LIST.PRODUCT_PRICE'] +`</td>
          <td>`+ t_arr['MEMBER_LIST.PRODUCT_QUANTITY'] +`</td>
          <td>`+ t_arr['REMARK'] +`</td>
        </tr>  
        <tr>
          <td>`+ sItem.order_name +`</td>
          <td>`+ sItem.name +`</td>
          <td>`+ m_price +`</td>
          <td>`+ sItem.quantity +`</td>
          <td>`+ sItem.remark +`</td>
        </tr>  
      </table>`
    }
    this.ogcatDialog.confirm(obj,{
      success:function(data){
        app.cancelOrder(sItem);
      },
      cancel:function(data){
      }
    });
  }

  cancelOrder(sItem){
    //this.firestore.collection("").doc("").delete({a:100})
    let app = this;
    this.http.delete(environment.db.team_order_detail, sItem.id, {
      success:function(data){
        app.ogcatTool.deleteArrayByID(app.order_list, sItem.id, "id");
        //app.toolFactory.loadingMask(false);
        //app.toolFactory.showMessage(app.translate.get('MEMBER_LIST.MSG_CANCEL')["value"]);//"訂單已取消!!"
      }
    });
  }
  
  goCheckOrder(){

    let app = this;
    let show_message;
    this.translate.get('MEMBER_LIST.MSG_CONFIRM_CHECK').subscribe((msg) => {
      show_message = msg;
    });

    let obj={
      message:show_message,//"結單後所有人將無法再新增訂單，您確定要結單?"
    }
    this.ogcatDialog.confirm(obj,{
      success:function(data){
        app.checkOrder();
      },
      cancel:function(data){
      }
    });
  }

  checkOrder(){
    let app =this;
    let editObj={ is_check:1 };
    let show_message;
    this.translate.get('TOTAL_LIST.MSG_CHECKED').subscribe((msg) => {
      show_message = msg;
    });
    
    this.http.update(environment.db.team_order, this.titleInfo.id, editObj,{
      success:function(data){
        app.ogcatDialog.alert(show_message);//"訂單已結束"
        app.is_check=1;
      }
    })
    
  }

  reSetPopover(second){
    $('[data-toggle="popover"]').popover('dispose');
    setTimeout(() => {
      $('[data-toggle="popover"]').popover();  
    }, second);
  }
  //========================= mobile ============================

  showEditModal(item){
    this.goEditOrder(item);
    $("#editModal").modal("show");
  }





}







/*

  deleteIndex(aObj){
    delete aObj.id;
    delete aObj.count;
    delete aObj.nick;
    delete aObj.c_code;
    delete aObj.copy;
    delete aObj.is_edit;
    aObj.is_pay =0;
    aObj.uid = this.uid;
  }

*/

/*

  checkToken(){
  //this.toolFactory.getNewToken();
  }
  showAddModal(){
    $("#addModal").modal("show");
  }

addOrder(){
    let app = this;
    this.addObj.m_code = this.mcode;
    this.addObj.c_code =this.ccode;
    this.addObj.uid = this.uid;
    let aObj = JSON.parse(JSON.stringify(this.addObj));
    this.deleteIndex(aObj);
    this.http.create(environment.db.team_order_detail, aObj,{
      success:function(data){
        app.addObj.id = data.id;  // app.addObj.nick = app.nick;
        let obj= JSON.parse(JSON.stringify(app.addObj));
        localStorage.setItem("order_name",app.addObj.name);
        app.order_list.unshift(obj);  
        app.addObj ={ 
          id:'',m_code:'', c_code:'',name:app.addObj.name, product:'',  quantity:null, uid:'',
          price:null, count:null, remark:'', is_edit:false
        }
        app.reSetPopover(100);
        $("#addModal").modal("hide");
        //let msg = app.translate.get('MEMBER_LIST.MSG_ORDER_SUCCESS')["value"];
        //app.ogcatTool.showMessage(msg);//"訂購成功"
      }
    });
  }
*/
  /*
    isLogin(){
    let userID = this.ogcatTool.getCookie("user_id");
    this.uid = userID;
    if(userID==null){
      this.uid= this.randomFactory.getRandomUID(this.mcode);
      this.ogcatTool.setCookie("user_id",this.uid);
      this.addObj.uid = this.uid;
    }
  }

   
   */
/**
 
  
  checkAddFiled(){
    let addObj = this.addObj;
    let is_ok = this.checkForm(addObj);
    if(is_ok){
      // 確認此團購是否結單，若尚未結單才可新增。
      
      if(this.ccode==null){
        this.isOrderCheck();
      }else{
        this.addOrder();
      }
    }
  }

   isOrderCheck(){
    let obj={ db: environment.db.team_order, id:this.mcode };
    let app = this;
    this.http.getByID(obj, {
       success:function(data){
         if(data.is_check==0){
          app.addOrder();
         }else{
          app.is_check = data.is_check;
          app.addObj ={ 
            id:'',  m_code:'', c_code:'', name: localStorage.getItem("order_name"), product:'',  quantity:null,  uid:'',
            price:null, count:null, remark:'', is_edit:false
          }
          app.ogcatDialog.alert("很抱歉，此團購已結單，要新增購物請洽團購負責人。");
         }
       }
    })
  } 
 */