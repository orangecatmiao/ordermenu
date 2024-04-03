import { Component, OnInit } from '@angular/core';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-menu-board',
  templateUrl: './menu-board.component.html',
  styleUrls: ['./menu-board.component.scss'],
  providers:[Firehttp, Tool1, OgcatDialog, OgcatTool]
})
export class MenuBoardComponent implements OnInit {
  
  title:string= '菜單公告';
  cInfo={id:'', on:false, info:'', uid:'',};
  userInfo;

  constructor(
    private http:Firehttp,
    private tool1:Tool1,
    private ogcatDialog:OgcatDialog
  ) { 
    this.userInfo = this.tool1.getSessionUserInfo();
    this.cInfo.uid = this.userInfo.uid;
  }

  ngOnInit(): void {
    this.getInfo();
  }

  getInfo(){
    let app =this;
    let obj={
      db:environment.db.menu_board,
      uid:this.userInfo.uid
    }
    
    this.http.getByUid(obj, {
      success: function(data){
        if(data.length>0){
          app.cInfo = data[0];
        }
      } 
    })
  }

  goSave(){
    let app =this;
    this.ogcatDialog.confirm("確認要更新?",{
     success:function(){
        if(app.cInfo.id==''){
          app.create();
        }else{
          app.update();
        }
     }
   })
  }

  update(){
    let cInfo = this.getSQLObj();
    this.http.update(environment.db.menu_board, this.cInfo.id, cInfo, {
      success: function(data){
      }
    });
  }

  create(){
    let app =this;
    let cInfo = this.getSQLObj();
    this.http.create(environment.db.menu_board, cInfo, {
      success: function(data){
        app.cInfo.id = data.id;
      }
    })
  }

  getSQLObj(){
    let cInfo = JSON.parse(JSON.stringify(this.cInfo));
    delete cInfo.id;
    delete cInfo.copy;
    return cInfo;
  }



}
