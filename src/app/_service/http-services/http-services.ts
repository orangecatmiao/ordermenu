import { Injectable} from '@angular/core';
import { HttpClient , HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map,filter} from 'rxjs/operators';

@Injectable()

export class HttpServices {
     
    constructor(private http: HttpClient) { }

    get(url,callback) {
     
        let headers = new HttpHeaders(environment.header);// this.http.get(environment.serviceUrl+url,{headers: headers })
        this.http.get(url,
          { headers: headers,
            observe: 'response',
            withCredentials:true,
          }).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
  
      }
      
      getCross(url){
        let headers = new HttpHeaders(environment.header);
        return this.http.get(url,{
            headers: headers,
            observe: 'response',
            withCredentials:true,
        }).pipe(
            filter( data=>{
               return true;
            }),
            map( resp =>{
                return resp.body;
            })
        );    
     }

      postCross(url,obj?:any){
        let headers = new HttpHeaders(environment.header);
        
      
        return this.http.post(url, {data:obj},{
            headers: headers,
            observe: 'response',
            withCredentials:true,
        }).pipe(
            filter( data=>{
               return true;
            }),
            map( resp =>{
                return resp.body;
            })
        );    
     }



  
      getByUrl(url,prameter_url,callback){
   
        let headers = new HttpHeaders(environment.header);
        
        let query = encodeURI("where="+prameter_url);
        let qurl = url+"?"+query;
        return this.http.get(environment.serviceUrl+qurl,{headers: headers}).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
  
       
      
      getByParameter(url,params, callback){
 
        let headers = new HttpHeaders(environment.header);
        this.http.get(environment.serviceUrl+url,{headers: headers,params:params }).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
  
      post(url,obj,callback) {
  
        let headers = new HttpHeaders(environment.header);
        this.http.post(environment.serviceUrl+url,obj,{headers: headers}).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
  
      put(url,obj, callback) {
   
        let headers = new HttpHeaders(environment.header);
        this.http.put(environment.serviceUrl+url,obj,{headers: headers}).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
  
      delete(url,obj, callback) {
   
        let headers = {
          headers: new HttpHeaders(environment.header), body: {"dellist":obj}
        };
       this.http.delete(environment.serviceUrl+url,headers).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
  
      delete2(url,obj, callback) {

        let headers = {
          headers: new HttpHeaders(environment.header), body: obj
        };
       this.http.delete(environment.serviceUrl+url,headers).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
  
      postImg(url,file, callback){
  
        let headers = {
          headers: new HttpHeaders(environment.uploadHeader)
        };
        this.http.post(environment.serviceUrl+url,file,headers).subscribe(
          (val) => {
            if(callback && callback.success){
              callback.success(val);
            }
          },
          response => {
             if(callback && callback.error){
              callback.error(response);
             }
          },
          () => {
            if(callback && callback.all){
              callback.all()
            }
          });
      }
     
      //==================  其他工具 ===================================
      getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
      }


}
