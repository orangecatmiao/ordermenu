import { Injectable } from '@angular/core';

@Injectable()

export class TimeRegionExtraServices {

    db ='time-region-extra';
  /**
     * 
     * @param pointer 
     * @param db 
     * @param callback 
     */
    getByYM(pointer, obj, callback ){
        let uid = JSON.parse(localStorage.userInfo).uid;
        pointer.ogcatTool.loadingMask(true);
        pointer.firestore.collection(this.db).ref.where('uid','==',uid).where('ym','==',obj.ym).get().then((querySnapshot) => {
            if(callback.success){
                let list=[];
                querySnapshot.forEach(function(doc) {
                    let obj = doc.data();
                    obj.id = doc.id;
                    obj.copy = JSON.parse(JSON.stringify(obj));
                    list.push(obj); // console.log(doc.id, " => ", doc.data());
                });
                callback.success(list);
                pointer.ogcatTool.showMessage("資料取得成功 !!");
            }
        }).catch(function(error) {
            pointer.ogcatTool.showErrorMessage("資料取得失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            pointer.ogcatTool.loadingMask(false);
        });
    }


    getByYM_customer(pointer, obj, callback ){
        //pointer.ogcatTool.loadingMask(true);
        pointer.firestore.collection(this.db).ref.where('uid','==',obj.uid).where('ym','==',obj.ym).get().then((querySnapshot) => {
            if(callback.success){
                let list=[];
                querySnapshot.forEach(function(doc) {
                    let obj = doc.data();
                    obj.id = doc.id;
                    obj.copy = JSON.parse(JSON.stringify(obj));
                    list.push(obj); // console.log(doc.id, " => ", doc.data());
                });
                callback.success(list);
                pointer.ogcatTool.showMessage("資料取得成功 !!");
            }
        }).catch(function(error) {
            pointer.ogcatTool.showErrorMessage("資料取得失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            //pointer.ogcatTool.loadingMask(false);
        });
    }


}
