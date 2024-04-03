import { Pipe, PipeTransform } from '@angular/core';





@Pipe({
    name: 'ison',
 })
export class IsOnTypePipe implements PipeTransform {
    transform(str: any): any {
        var cname='';
        switch(str){
            case(0):
                cname="關閉";
            break;
            case(1):
                cname="開啟";
            break;
        }
        return cname;
    }
}



@Pipe({
    name: 'gender',
 })
export class GenderPipe implements PipeTransform {
    transform(str: any): any {
        var cname='';
        switch(str){
            case(1):
                cname="男";
            break;
            case(2):
                cname="女";
            break;
        }
        return cname;
    }
}



@Pipe({
    name: 'noSecond',
 })
export class NoSecondPipe implements PipeTransform {
    transform(str: any): any {
        if(str == null || str==""){
            return "";
        }
        var cdate= str.split(":");
        cdate.pop();
        cdate= cdate.join(":");
        return cdate;
    }
}


@Pipe({
    name: 'noTime',
 })
export class NoTimePipe implements PipeTransform {
    transform(str: any): any {
        if(str == null || str==""){
            return "";
        }
        var cdate= str.split(" ");
        cdate.pop();
        //cdate= cdate.join(":");
        return cdate;
    }
}


@Pipe({
    name: 'week',
 })
export class WeekPipe implements PipeTransform {
    transform(str: any): any {
        var cname='';
        switch(parseInt(str)){
            case(1):
                cname="一";
            break;
            case(2):
                cname="二";
            break;
            case(3):
                cname="三";
            break;
            case(4):
                cname="四";
            break;
            case(5):
                cname="五";
            break;
            case(6):
                cname="六";
            break;
            case(0):case(7):
                cname="日";
            break;
        }
        return cname;
    }
}



@Pipe({
    name: 'showweek',
 })
export class ShowWeekPipe implements PipeTransform {
    transform(str: any): any {
        if(str == null || str==""){
            return "";
        }
        let currentdate = new Date(str);
        let week = currentdate.getDay();
        let cdate= '';
        switch(week){
            case(1):cdate= '(一)'; break;
            case(2):cdate= '(二)'; break;
            case(3):cdate= '(三)'; break;
            case(4):cdate= '(四)'; break;
            case(5):cdate= '(五)'; break;
            case(6):cdate= '(六)'; break;
            case(7):cdate= '(日)'; break;
        }
        return cdate;
    }
}

