import { Component, OnInit,  Input, Output, EventEmitter } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OgcatDialog, OgcatTool } from '../../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from 'src/app/_service/firehttp';
import { Tool1 } from '../../../_factory/tool1/tool1';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-team-total',
  templateUrl: './team-total.component.html',
  styleUrls: ['./team-total.component.scss'],
  providers:[OgcatDialog, OgcatTool, Tool1]
})
export class TeamTotalComponent implements OnInit {
  title = '訂單列表-負責人';
  params;
  total_price:number = 0 ;
  is_check:number = 0; //此訂單是否已結單
  sort_order_list = [];
  sort_order_list_name = [];
 
  /*
  sort_order_list = [{name:'', quantity:0, price:0,  list:[], is_hide:true, price_obj:{price_id:''},}];
  sort_order_list_name = [{order_name:'',  sub_total_price:0, list:[], paid:false, is_hide:true, }];
 
  */
  show1=0; //大綱0 / 詳細1
  show2=-1; //未付款0 / 已付款1
  show3=false;
  pay:boolean=false;
  unpay:boolean=false;
  
  @Input() is_total;
  @Input() titleInfo ={ id:'',c_code:'',title:'', order_name:'', store_name:'', end:'', is_check:0, remark:'', created:''};
  @Input() mcode:string ='';
  @Input() ccode:string ='';
  @Input() order_list =[];
  @Input() charge:boolean= false;
  @Output() voted = new EventEmitter<boolean>();


  constructor(
    private ogcatDialog: OgcatDialog,
    private ogcatTool: OgcatTool,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private http:Firehttp,
    private tool1:Tool1
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => { 
      this.params =params;
     
   });
  }

  ngOnChanges(){
    if(this.order_list.length > 0){
      this.resetOrderListByName();
      this.resetOrderList();// this.initShow();
     
    }
    if(this.titleInfo.store_name!=''){
      this.is_check = this.titleInfo.is_check;
    }
  }

 

  goVote(obj) {
    this.voted.emit(obj);
  }

  showMember(){
    this.goVote({is_total:false});
  }

  resetOrderList(){
    let app =this;
    app.sort_order_list =[];
    this.order_list.forEach(function(val){
        let is_have =0;
        
        app.sort_order_list.forEach(function(s_val){
          if(s_val.name === val.name){
            let same=false;
            if(val.price_obj!=null){
              if(val.price_obj.price_id === s_val.price_obj.price_id){
                same = true;
              }
            }else{
              same = true;
            }
            if(same){
              is_have++;
              if(s_val.list == null){
                s_val.list=[];
              }
              s_val.list.push(val);
            }
          }
        });

        if(is_have === 0){
          let obj ={
            name: val.name,
            quantity:parseInt(val.quantity),
            price: val.price,
            price_obj:val.price_obj,
            list: [JSON.parse(JSON.stringify(val))],
            gclass:'product',
            gclass2:'badge-warning',
            is_hide: true
          }
          app.sort_order_list.push(obj);
        }
    });
    console.log(app.sort_order_list);
    
    this.getTotalPrice();
  }
  
  getTotalPrice(){
    let total=0;
    this.sort_order_list.forEach(function(val){
      let quantity=0;
      val.list.forEach(function(mval){
        let t_price;
        if(mval.price_obj!=null){
          t_price = mval.price_obj.price;
        }else{
          t_price = mval.price;
        }
        total += t_price * mval.quantity;
        quantity += parseInt(mval.quantity)
      })
      val.quantity = quantity;
    });
    this.total_price = total;
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

  //mtype: name/product 
  goPay(mtype:string,xitem){
    let app =this;
    let editObj ={
      c_code: this.ccode ,
      is_pay: xitem.is_pay
    };
    
    this.http.update( environment.db.team_order_detail, xitem.id, editObj, {
      success:function(data){
         //=========================== 顯示訊息 ==============================
        /**
           let show_message;
          app.translate.get('MEMBER_LIST.MSG_EDIT_SUCCESS').subscribe((msg) => {
            show_message = msg;
          });
          app.ogcatTool.showMessage(show_message);
         */
        //========================  .顯示訊息  ================================
          if(mtype==='product'){
              app.sort_order_list_name.forEach(function(val){
                val.list.forEach(function(ival){
                  if(xitem.id === ival.id){
                    ival.is_pay = xitem.is_pay; 
                  }
                });
              })
          }else if(mtype==='name'){
              app.sort_order_list.forEach(function(val){
                val.list.forEach(function(ival){
                  if(xitem.id === ival.id){
                    ival.is_pay = xitem.is_pay; 
                  }
                })
              })
          }
          app.sort_order_list_name.forEach(function(val){
            let paid =0;
            val.list.forEach(function(ival){
              if(ival.is_pay == true){
                paid ++; 
              }
            });
            if(paid == val.list.length){
              val.paid = true;
            }else{
              val.paid = false;
            }
          });
      }
    });    
  }

  goPay2(mtype,xitem){
    xitem.is_pay=!xitem.is_pay
    this.goPay(mtype,xitem);
  }
  
  showUnPay(){
    let app =this;
    this.pay =false;
    this.unpay =!this.unpay;
    this.sort_order_list.forEach(function(val){
      val.list.forEach(function(mval){
        if(mval.is_pay === 0){
          mval.is_hide = !app.unpay;//false
        }else{
          mval.is_hide = app.unpay;//true
        }

        if(app.pay == false && app.unpay == false){
          mval.is_hide = false;
        }

      })
    });
    this.sort_order_list_name.forEach(function(val){
      val.list.forEach(function(mval){
        if(mval.is_pay === 0){
          mval.is_hide = !app.unpay;//false
        }else{
          mval.is_hide = app.unpay;//true
        }

        if(app.pay == false && app.unpay == false){
          mval.is_hide = false;
        }

      })
    });
  }

  showPay(){
    let app =this;
    this.unpay =false;
    this.pay =!this.pay;
    this.sort_order_list.forEach(function(val){
      val.list.forEach(function(mval){
        if(mval.is_pay === 1){
          mval.is_hide =  !app.pay;//false;
        }else{
          mval.is_hide = app.pay;//true;
        }
        if(app.pay == false && app.unpay == false){
          mval.is_hide = false;
        }
      })
    });
    this.sort_order_list_name.forEach(function(val){
      val.list.forEach(function(mval){
        if(mval.is_pay === 1){
          mval.is_hide =  !app.pay;//false;
        }else{
          mval.is_hide = app.pay;//true;
        }
        if(app.pay == false && app.unpay == false){
          mval.is_hide = false;
        }
      })
    });
  }
  
  showAll(){
    this.show2=-1;
    this.sort_order_list.forEach(function(val){
      val.list.forEach(function(mval){
        mval.is_hide = false;
      })
    });
    this.sort_order_list_name.forEach(function(val){
      val.list.forEach(function(mval){
        mval.is_hide = false;
      })
    });
  }

  hideAll(bool){
    if(bool){
      this.show1=0;
    }else{
      this.show1=1;
    }
    this.sort_order_list.forEach(function(val){
      val.is_hide = bool;
    });
    this.sort_order_list_name.forEach(function(val){
      val.is_hide = bool;
    });
  }

  changeColorAndSort(item, event){
    if(item.gclass=='product'){
      item.gclass = 'product2';
      item.gclass2 ='badge-danger';
    }else{
      item.gclass = 'product';
      item.gclass2 ='badge-warning';
    }
   
    this.sort_order_list =  this.sort_order_list.sort(function (a:any, b:any) { 
      return a.gclass < b.gclass ? 1 : -1;//1後面 -1前面
    });
  }

//===============================  姓名排列 ============================================================

  resetOrderListByName(){
    let app =this;
    app.sort_order_list_name =[];
    this.order_list.forEach(function(val){
        let is_have =0;
        
        app.sort_order_list_name.forEach(function(s_val){
          if(s_val.order_name === val.order_name){
            is_have++;
            if(s_val.list == null){
              s_val.list=[];
            }
            s_val.list.push(val);
          }
        });
        if(is_have === 0){
          let obj ={
            order_name:val.order_name,
            //price: val.price,
            price_obj: val.price_obj,
            list: [JSON.parse(JSON.stringify(val))],
            is_hide: true,
            paid:false,
            sub_total_price:0
          }
          app.sort_order_list_name.push(obj);
        }
        
    });
   
    this.setNameItemSubTotal();
    this.setIsPaid();
   // console.log("name",app.sort_order_list_name);
  }

  setNameItemSubTotal(){
    let app =this;
    this.sort_order_list_name.forEach(function(val){
        val.sub_total_price =0;
        val.list.forEach(function(mval){
          let m_price;
          if(mval.price_obj!=null){
            m_price = mval.price_obj.price;
          }else{
            m_price = mval.price;
          }
          val.sub_total_price +=  m_price*mval.quantity;
        });
    });
  }

  setIsPaid(){
    let app =this;
    this.sort_order_list_name.forEach(function(val){
        let paylength = 0;
        let i_length =val.list.length;
        val.list.forEach(function(mval){
          if(mval.is_pay===true){
            paylength++;
          }
        });
        
        if(i_length=== paylength){
         val.paid =true;
        }else{
         val.paid =false;
        }
    });
   
  }




}
