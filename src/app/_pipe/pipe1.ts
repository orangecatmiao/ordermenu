

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'payshow',
 })
export class PayShow implements PipeTransform {
    transform(str: any):any { 
        if(str=='0'){
            return "未付";
        }
        if(str=='1'){
            return "已付";
        }
        if(str == null || str==""){
            return "";
        }
    }
}





@Pipe({
    name: 'ym',
 })
export class ym implements PipeTransform {
    transform(str: string):string { 
       let year = str.slice(0,4);
       let month = str.slice(4,6);
       return year+'/'+month;
    }
}


@Pipe({
    name: 'zday',
 })
export class ZDay implements PipeTransform {
    transform(str: string):string { 
       if(parseInt(str)<10){
        return "0" + str;
       }
       return str;
    }
}




@Pipe({
    name: 'orderstatus',
 })
export class OrderStatus implements PipeTransform {
    transform(str: number):string { 
       switch(str){
           case(0):
           return "有效";

           case(1):
           return "取消";
       }
    }
}

@Pipe({
    name: 'checktatus',
 })
export class CheckStatus implements PipeTransform {
    transform(str: number):string { 
       switch(str){
           case(0):
           return "未結單";

           case(1):
           return "已結單";
       }
    }
}


@Pipe({name: 'nl2br'})
export class Nl2br implements PipeTransform {
transform(value: string): string {
      return value.replace(/\n/g, '<br/>');
   }
}