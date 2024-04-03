import { Component, OnInit, Input, Output,  EventEmitter} from '@angular/core';
import { Firehttp } from '../../../_service/firehttp';

import { environment } from '../../../../environments/environment';
import { Calendar } from '../../../_factory/calendar';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../../projects/ogcat-tool-package/src/public-api';
import { Tool1 } from '../../../_factory/tool1/tool1';

@Component({
  selector: 'app-team-info',
  templateUrl: './team-info.component.html',
  styleUrls: ['./team-info.component.scss'],
  providers:[Calendar, OgcatTool, OgcatDialog, Firehttp, Tool1]
})
export class TeamInfoComponent implements OnInit {

  teamOrderObj={ id:'', title:'', end:'', remark:'', qrcode_url:'', qr_width:128, qr_height:128 };
  teamOrderInfo={
    id: "", order_name: "", end:"",  remark: "", store_anme: "", is_check:0,
    store_id: "", title: "", order_uid: ""
  };
  team_order_list=[];
  locale;
  
  @Input('is_off_day') is_off_day = false;
  @Input('cInfo') cInfo={ id:'', uid:'', store_name:''};
  @Input('userInfo') userInfo; 
  @Input('params') params; 
  @Output() voted = new EventEmitter<boolean>();
  
  constructor(
    private http :Firehttp,
    private calendar:Calendar,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private tool1:Tool1
  ) { }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
  }


  ngOnChanges(changes): void{
    if(changes.params!=null && changes.params.currentValue!=null){
      if(changes.params.currentValue.team_order_id!=null){
        this.getTeamOrder();
      }
    }
  }
   //========================== 團購相關-- 建立團購  ==========================================

  openTeamorderModal(){
    let is_show_login = this.isShowLogin();
    if(is_show_login){
      return;
    }
    $('#teamorderModal').modal('show');
  }

  setUserInfo(){
    this.userInfo =this.tool1.getSessionUserInfo();
  }

  goCreateTeamOrder(){
    let app =this;
    this.ogcatDialog.confirm("確認要成立團購?",{
     success:function(){
        
        app.createTeamOrder();
     }
    })
  }

  createTeamOrder(){
    let app =this;
    let addObj={
      store_name:this.cInfo.store_name,
      store_id:this.cInfo.id,
      title:this.teamOrderObj.title,
      end: this.calendar.getStrYMDHMSbyObj(this.teamOrderObj.end),
      remark:this.teamOrderObj.remark,
      order_name:this.userInfo.displayName,
      order_uid:this.userInfo.uid,
      is_check:0,
      check_time:'',
    };
    this.http.create(environment.db.team_order, addObj, {
      success:function(data){
        app.teamOrderObj.id = data.id;
        app.teamOrderObj.qrcode_url = location.origin  +'/user/menu/' + app.cInfo.id + '/' + data.id;
        app.generateQRcode();
      }
    });
  }

  generateQRcode(){
    document.getElementById("team-qrcode").innerHTML=''
    var qrcode = new QRCode(document.getElementById("team-qrcode"), {
      text: this.teamOrderObj.qrcode_url,
      width: this.teamOrderObj.qr_width ,
      height: this.teamOrderObj.qr_height ,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }


  isShowLogin(){
    this.setUserInfo();
    if(this.userInfo==null || this.userInfo==''){
      $("#loginModal").modal("show");
      return true;
    }
    return false;
  }



 //========================== 團購相關-- 取得資料與寫入  ==========================================

  getTeamOrder(){
    let app =this;
    let obj ={
      db: environment.db.team_order,
      id: this.params.team_order_id
    }
    this.http.getByID(obj, {
      success:function(data){
        if(data!=null){
          app.teamOrderInfo = data;
          app.voted.emit(data);
        } 
      }
    })
  }

 /*
  getTotalTeamOrderPrice(){
    let price =0;
    this.team_order_list.forEach(function(val){
      if(val.price_obj!=null){
        price += val.price_obj.price;
      }else{
        price += val.price;
      }
    });
    return price;
  }

 */
 



}
