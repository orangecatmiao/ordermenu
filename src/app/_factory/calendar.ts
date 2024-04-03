import { Injectable } from '@angular/core';

@Injectable()

export class Calendar {

    constructor(){}

    initCalendar(searchObj){
        let t = new Date(searchObj.year+"/"+ searchObj.month +"/"+"01");
        let first_day_week =  t.getDay();
    
        let arr =[];
        let m = [];
        let day = 1;
        let len =7;
        let month_day = this.getDayByMonth(searchObj.year + '', searchObj.month + '');
    
        for(let i=0; i<=50; i++){
         
          if(i<first_day_week && day===1){
            m.push({day:null});
          }else{
            if( m.length === len && day<month_day+1){
              arr.push(JSON.parse(JSON.stringify(m)));
              m=[];
            }else if(day===month_day){
              m.push({day:day});
              arr.push(JSON.parse(JSON.stringify(m)));
              m=[];
              day++;
            }else{
              m.push({day:day});
              day++;
            }
          }
          if(day>month_day){
            day++;
          }
         
        }//.for
        return  arr;
       
    }

    /**
     * 原本的時間加上分鐘數
     * @param obj 
     */
    addMinutes(obj){
      let today = this.getTodayStr();
      var d1 = new Date (today + " "+ obj.s_hour+":"+obj.s_min);
      var d2 = new Date ( d1 );
      d2.setMinutes ( d1.getMinutes() + parseInt(obj.during) );
      return d2;
    }
     

    getTodayStr(){
      let today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth();
      month = month+1;
      let day = new Date().getDate();
      return year +"/"+month+'/'+ day;
    }

    getDayByMonth(year:string, month:string){
      let isRoom = this.isRoomYear(year);
      switch(month){
        case("1"): return 31;
        case("2"): 
          if(isRoom===true){
            return 29;
          }else{
            return 28;
          }
        case("3"): return 31;
        case("4"): return 30;
        case("5"): return 31;
        case("6"): return 30;
        case("7"): return 31;
        case("8"): return 31;
        case("9"): return 30;
        case("10"): return 31;
        case("11"): return 30;
        case("12"): return 31;
      }
    }
  
  
    isRoomYear(year){
      let is = (year%4===0&&year%100!==0||year%400===0)?(true):(false);
      return is;
    }


    localize(){
      return{
        firstDayOfWeek: 0,
        dayNames: ["日", "一", "二", "三", "四", "五", "六"],
        dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
        monthNames: [ "1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月" ],
        monthNamesShort:  [ "1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月" ],
        today: '今天',
        clear: '清除',
        dateFormat: 'yy/mm/dd',
        weekHeader: '星期'
      };
    }

    getStrYMDbyObj(pay_day, sign?){
      if(pay_day == null || pay_day==''){
        return '';
      }
      let ym = {
        year: pay_day.getFullYear(),
        month: pay_day.getMonth()+1,
        day: pay_day.getDate()
      }
      let month = (ym.month<10)? "0"+ym.month : ym.month;
      let day =  (ym.day<10)? "0"+ ym.day : ym.day;
      if(sign){
        return ym.year + sign + month + sign + day; 
      }else{
        return ym.year +'-'+ month +'-'+ day; 
      }
    }

    getStrYMbyObj(pay_day){
      if(pay_day == null || pay_day==''){
        return '';
      }
      let ym = {
        year: pay_day.getFullYear(),
        month: pay_day.getMonth()+1,
        day: pay_day.getDate()
      }
      let month = (ym.month<10)? "0"+ym.month : ym.month;
      return ym.year +'-'+ month
    }

    getStrYMnoDashbyObj(pay_day){
      if(pay_day == null || pay_day==''){
        return '';
      }
      let ym = {
        year: pay_day.getFullYear(),
        month: pay_day.getMonth()+1,
        day: pay_day.getDate()
      }
      let month = (ym.month<10)? "0"+ym.month : ym.month;
      return ym.year.toString() + month.toString()
    }


    getStrYMDHMSbyObj(pay_day){
      if(pay_day == null || pay_day==''){
        return '';
      }
      let ym = {
        year: pay_day.getFullYear(),
        month: pay_day.getMonth()+1,
        day: pay_day.getDate(),
        hours:pay_day.getHours(),
        minutes:pay_day.getMinutes(),
        seconds:pay_day.getSeconds()
      }
      let month = (ym.month<10)? "0"+ym.month : ym.month;
      let day =  (ym.day<10)? "0"+ ym.day : ym.day;
      let hours = (ym.hours<10)? "0"+ym.hours : ym.hours;
      let minutes = (ym.minutes<10)? "0"+ym.minutes : ym.minutes;
      let seconds = (ym.seconds<10)? "0"+ym.seconds : ym.seconds;
      return ym.year +'/'+ month +'/'+ day + " "+ hours + ':'+ minutes+ ':' + seconds;
    }

    isEarlyEqualObj(some_day:Date){
     // let today = this.getTodayStr();
     // let ok= some_day.getTime() < new Date(today).getTime() ;
     let ok= some_day.getTime() < new Date().setHours(0,0,0,0) ;
    
      if(ok){
        return true;
      }else{
        return false;
      }
    }

    getWeek(day:string):number{
      let dayObj = new Date(day);
      return dayObj.getDay();
    }

    setWeek(list){
      let app=this;
      list.forEach(function(val){
        val.week = app.getWeek(val.off);
      });
     
    }
  




}
 