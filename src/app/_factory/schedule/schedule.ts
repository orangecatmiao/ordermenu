
import { Injectable } from '@angular/core';

@Injectable()

export class Schedule {

    setSettingList(day_list, setting_list){
      day_list.forEach(function(val,key){
        val.forEach(function(mval,mkey){
          let day_week;
          if(mkey===0){ 
            day_week =7
          }else{ 
            day_week = mkey 
          }
  
          mval.add_obj = {s_hour:'',s_min:'',e_hour:'',e_min:''}
          mval.add_order_obj = {s_hour:'',s_min:'',e_hour:'',e_min:'', during:''}
          mval.is_add = false;
          mval.is_add_order=false;
  
          if(mval.s_list==null){ mval.s_list = []}
          
          setting_list.forEach(function(sval,skey){
            if(day_week == sval.week){
              mval.s_list.push(JSON.parse(JSON.stringify(sval)));
            }
          });//.setting_list.forEach
        });//.val.forEach
      });//day_list.forEach
    }
}
