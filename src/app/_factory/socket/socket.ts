import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()

export class Socket {
     constructor(
        private firedatabase:AngularFireDatabase,
     ){}
     
     chooseSocket(infowallobj, sokct){
        switch(infowallobj.ty){
          case('E')://E:訂單
            infowallobj.soketurl=sokct.socketOrderUrl;
            this.socketAdd(infowallobj);
          break;
    
          case('P')://P:付款
            infowallobj.soketurl=sokct.socketPayUrl;
            this.socketAdd(infowallobj);
          break;
    
          case('C')://C:取消訂單
          infowallobj.soketurl=sokct.socketCancelUrl;
            this.socketAdd(infowallobj);
          break;
    
          case('PE')://PE:已付款訂單
          infowallobj.soketurl=sokct.socketOrderPayUrl;
            this.socketAdd(infowallobj);
          break;

          case('CP')://CP:商店確認客戶已付款
          infowallobj.soketurl=sokct.socketCheckPayUrl;
            this.socketAdd(infowallobj);
          break;
    
        }
      }

      socketAdd(infowallobj){
        this.firedatabase.database.ref(infowallobj.soketurl + infowallobj.des).set({
          t: infowallobj.info_wall_id,//infowall 的 id
        });
      }

}


