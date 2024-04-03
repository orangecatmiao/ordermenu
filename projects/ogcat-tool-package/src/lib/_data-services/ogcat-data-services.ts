import { Injectable } from '@angular/core';
import { Observable,Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})



export class OgcatDataServices {
    constructor() { }
    private subject = new Subject<any>();
    private subject2 = new Subject<any>();
    private subject3 = new Subject<any>();
    private subject4 = new Subject<any>();
    private subject5 = new Subject<any>();
    private subject6 = new Subject<any>();
    private subject7 = new Subject<any>();
    private subject8 = new Subject<any>();
  
   
  
  
    /**===========  lodingMask  ===========*/
    getLoadingMask(): Observable<any> {
        return this.subject.asObservable();
      }
      sendLoadingMask(bool:boolean) {
        this.subject.next(bool);
    }
    clearLoadingMask() {
        this.subject.next();
    }

  
    /**===========  message  ===========*/
    getData(): Observable<any> {
      return this.subject2.asObservable();
    }
    sendData(message: object) {
      this.subject2.next(message);
    }
    clearData() {
      this.subject2.next();
    }
  
  
    /**===========  userInfo  ===========*/
    getUser(): Observable<any> {
      return this.subject3.asObservable();
    }
    sendUser(message: object) {
      this.subject3.next(message);
    }
    clearUser() {
      this.subject3.next();
    }


    /**===========  agreePrivacy  ===========*/
    getAgreePrivacy(): Observable<any> {
      return this.subject4.asObservable();
    }
    sendAgreePrivacy(agree: boolean) {
      this.subject4.next(agree);
    }
    clearAgreePrivacy() {
      this.subject4.next();
    }


}
