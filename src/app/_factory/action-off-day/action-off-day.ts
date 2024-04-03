import { Injectable } from '@angular/core';

@Injectable()


export class ActionOffDay {

    constructor(){}

    separateListByType(app){
        
        app.all_list.forEach(function(val){
            if(val.type=='1'){
              app.weekObj.week_list_id = val.id;
              app.weekObj =val;
            }else if(val.type=='2'){
              app.list.push(val);
            }
        });
        if(app.list.length>0){
          app.tool1.reSortWeek(app.list, 'off');
          app.calendar.setWeek(app.list);
        }
    
        if(app.weekObj.off!=''){
            app.storeFunc.setWeekList(JSON.parse(JSON.stringify(app.weekObj)),  app.week_list);
        }
      }
}
