import { Injectable } from "@angular/core";


@Injectable()
export class OgcatCalendar {
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

      sayHello(){
          alert("Hello Lala")
      }
}
