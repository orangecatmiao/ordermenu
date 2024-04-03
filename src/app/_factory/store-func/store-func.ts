import { Injectable } from '@angular/core';

@Injectable()


export class StoreFunc {
    constructor(){}

    setWeekList(val, list){
      let app =this;
      if(val.off==''){
        list.forEach(function(val){
          val.rest = false;
        });
        val.week_list_change = false;
        return;
      }
      let off_list = val.off.split(',');
      
      off_list.forEach(function(val,key){ console.log(val)
         let mk = (val=='true')?true:false;
         list[key].rest = mk;
       
      });
    }
    //menu 用到
    isOfffDay(list){
      let offday=0;
      list.forEach(function(val){
        if(val.type==1){//固定休假
          let today_week = new Date().getDay();
          let week_list = val.off.split(',');
          let ele = (week_list[today_week-1]=='true')?true:false;
          if(ele){
            offday++;
          }
        }else if(val.type==2){//特定休假
          let today_timestamp =new Date().setHours(0,0,0,0);
          let off_timestamp = new Date(val.off).getTime();
          if(today_timestamp == off_timestamp){
            offday++;
          }
        }
      });  
      if(offday>0){
        return true;
      }
      return false;
    }

}
