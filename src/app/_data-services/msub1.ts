import { Injectable } from '@angular/core';
import { Observable,Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class Msub1 { 
    constructor() { }
    private subject1 = new Subject<any>();
    private subject2 = new Subject<any>();
    private subject3 = new Subject<any>();
    private subject4 = new Subject<any>();

   
    /**===========  info-wall  ===========*/
    getShowInfoWall(): Observable<any> {
        return this.subject1.asObservable();
    }
    sendInfoWall(isshow: boolean) {
        this.subject1.next(isshow);
    }
    clearInfoWall() {
        this.subject1.next();
    }



    /**===========  ws --> order  ===========*/
    getWSOrder(): Observable<any> {
        return this.subject2.asObservable();
    }
    sendWSOrder(isshow: boolean) {
        this.subject2.next(isshow);
    }
    clearWSOrder() {
        this.subject2.next();
    }



    /**===========  ws --> act  ===========*/
    getWSAct(): Observable<any> {
        return this.subject2.asObservable();
    }
    sendWSAct(isshow: boolean) {
        this.subject2.next(isshow);
    }
    clearWSAct() {
        this.subject2.next();
    }


    /**===========  add storeInfo  ===========*/
    getStoreInfo(): Observable<any> {
    return this.subject3.asObservable();
    }
    sendStoreInfo(cInfo: any) {
        this.subject3.next(cInfo);
    }
    clearStoreInfo() {
        this.subject3.next();
    }




}
 