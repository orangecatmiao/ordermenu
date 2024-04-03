import { Injectable } from '@angular/core';
import { OgcatTool, OgcatDialog } from '../../../projects/ogcat-tool-package/src/public-api';

@Injectable()

export class CheckTool {
    constructor(
        private ogcatTool:OgcatTool,
        private ogcatDialog:OgcatDialog
    ){}



    /**
     * 確認時間是否為空值與非數字
     * @param item 
     */
    checkTimeEmpty(item){
      if( item.s_hour==''  ||  item.s_min == '' ||  item.e_hour == '' ||  item.e_min == '' ){
        this.ogcatTool.showErrorMessage("開始時間與結束時間為必填");
        return false;
      }
  
      if( isNaN(item.s_hour)===true  ||  isNaN(item.s_min)===true ||  isNaN(item.e_hour)===true ||  isNaN(item.e_min)===true){
        this.ogcatTool.showErrorMessage("時間只能填入數字");
        return false;
      }
  
      if( parseInt(item.s_hour)>23 || item.e_hour>23 ){
        this.ogcatTool.showErrorMessage("小時數最多為23");
        return false;
      }
  
      if( parseInt(item.s_min)>59 || item.e_min>59 ){
        this.ogcatTool.showErrorMessage("分鐘數最多為59");
        return false;
      }

      if(parseInt(item.s_hour+ item.s_min) > parseInt(item.e_hour+ item.e_min)){
        this.ogcatDialog.alert("時間區間不正確!!開始時間必須小於結束時間");
        return false;
      }
    
      return true;
    }

    /**
     * 確認時段是否有重疊
     * @param item 
     * @param week_list 
     */
    checkTime(item, week_list){
        this.addZero(item);
        let empty_check = this.checkTimeEmpty(item);
        if(!empty_check){
          return false;
        }
    
    //todo 判斷時間區間的大小，結束時間不能小於開始時間
       
        item.start = item.s_hour + ':' + item.s_min;
        item.end = item.e_hour + ':' + item.e_min;
       
        if(week_list==null){
            return true;
        }

        let error =0;
        week_list.forEach(function(val){
          if( (item.start>= val.start && item.start< val.end) || (item.end> val.start && item.end<= val.end)   ){
            error++;
          }
        });
        if(error>0){
          this.ogcatDialog.alert("您的時間重疊了!!");
          return false;
        }
        return true;
      
    }

    /**
     * 確認時段是否存在
     * @param item 
     * @param time_list 
     */
    checkTimeExist(item, time_list){
      item.start = item.s_hour + ':' + item.s_min;
      item.end =  item.e_hour + ':' + item.e_min;
    
      let today = this.getTodayStr();

      let start = new Date(today + " " +item.start);
      let end = new Date(today + " " +item.end);
     
      let during_count=0;

      time_list.forEach(function(val){
        let val_start = new Date(today + " " +val.start);
        let val_end =  new Date(today + " " +val.end);
        
        if(start>= val_start && end<=val_end){
          during_count++;
        }
      });
      if(during_count != 1){
        this.ogcatDialog.alert("您的時不在預約區間!!");
        return false;
      }
      return true;

    }


    getTodayStr(){
      let today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth();
      month = month+1;
      let day = new Date().getDate();
      return year +"/"+month+'/'+ day;
    }

    addZero(item){
      let mitem =item;
      if(mitem.s_hour<10 && mitem.s_hour.length<2 ){
        mitem.s_hour = '0'+ mitem.s_hour;
      } 
      if(mitem.s_min<10 && mitem.s_min.length<2){
        mitem.s_min = '0'+ mitem.s_min;
      } 
      if(mitem.e_hour<10 && mitem.e_hour.length<2){
        mitem.e_hour = '0'+ mitem.e_hour;
      } 
      if(mitem.e_min<10 && mitem.e_min.length<2){
        mitem.e_min = '0'+ mitem.e_min;
      } 
    }
}
