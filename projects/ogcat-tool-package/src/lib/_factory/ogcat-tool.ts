import { Injectable } from '@angular/core';
import { OgcatDataServices } from '../_data-services/ogcat-data-services';

@Injectable()


export class OgcatTool {
    constructor(private ds: OgcatDataServices) {}


    /**
     * 顯示/隱藏 Loading 等待圖示
     * @param bool : boolean , true顯示/false隱藏
     */
    loadingMask(bool:boolean):void {
        this.ds.sendLoadingMask(bool);
    }

    /**
     * 顯示成功提示字串， 3 秒後消失
     * @param message : 要顯示的提示字串
     */
    showMessage(message:string):void{
        var app = this;
        var msg={
          success:true,
          text:message
        }
        app.ds.sendData(msg);
        setTimeout(function(){
          app.ds.sendData({success:false,text:""});
        },3000)
    }


    /**
     * 顯示錯誤提示字串， 3 秒後消失
     * @param message : 要顯示的提示字串
     */
    showErrorMessage(message:string):void{
      var app = this;
      var msg={
        error:true,
        text:message
      }
      app.ds.sendData(msg);
      setTimeout(function(){
        app.ds.sendData({error:false,text:""});
      },3000)
  }


    /**
     * 依名稱取得 cookies 值 
     * @param name : cookies 的名稱
     */
    getCookie(name:string):string {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    /**
     * 依名稱設定 cookies 值 
     * @param name : 名稱
     * @param value : 值
     * @param days : 期限(天)
     */
    setCookie(name:string, value:string, days?:any):void {
        var expires = "";
        if (days==null) { days = 365 }
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
       
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    deleteAllCookies() {
      var cookies = document.cookie.split(";");
  
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
   

    
    deleteArrayByID(list:Array<any>, mval, key:string){
      for (var i = list.length; i-- && list[i][key] !== mval;);
      if (i >= 0) list.splice(i, 1);
      return list;
    }


    isShowSuccess(data){
      if(data && data.errorObj && data.errorObj.code && data.errorObj.code=='0'){
        return true;
      }
      return false;
    }

    isSuccess(data) {
      if(data.errorObj && data.errorObj.code && data.errorObj.code==='0'){
          return true;
      }
      return false;
    }



    addJSDefer(src, callback){
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.onload= callback; 
      s.src = src;
      s.defer =true;
      document.getElementsByTagName('head')[0].appendChild(s);
    }
    
    addJS(src, callback){
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.onload= callback; 
      s.src = src;
      document.getElementsByTagName('head')[0].appendChild(s);
    }
  
  
    //判斷是否為中文字
    isPureChinese(input) {  
      var reg = /^[\u4E00-\u9FA5]+$/
      if (reg.test(input)) {
        return true
      } else {
        return false
      }
    }

    
    reSortWeek(list, e_name ){
      list = list.sort(function (a, b) { 
        return a[e_name] > b[e_name] ? 1 : -1;//1後面 -1前面
      });
    }

    sayHello(){
      alert("Hello World!!")
    }

  
}


 /*
     example : this.list_add = this.toolFactory.deleteArrayByKeyIndexZero(this.list_add, "checked","1");
    */
   /**
    * 指定元素名稱的值為為刪除元素的判斷
    * @param items 要刪除元素的陣列
    * @param key 指定要刪除某個值的 key 名稱
    * @param val 指定上面的 key 值為多少是刪除的條件
    * example: list:Array 要刪除 id = 5 的元素---> 
    * deleteArrayByKey(list, id, 5) 或
    * deleteArrayByKey(list, id, '5')
    */
    /**
    deleteArrayByKey(items:Array<any>, key:string, val:any): any{
      return items.filter(x => {
        return x[key] != val;
      })
    }
    

    deleteArrayByKeyIndexZero(items:Array<any>, key:string, val:any){
      return items.filter(x => {
        if(x[key]){
          return x[key][0] != val;
        }else{
          return x;
        }
      })
    } 
     */