import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Firehttp } from '../../_service/firehttp'
import { environment } from 'src/environments/environment';

@Injectable()

export class UserAction {
    db;

    constructor(
        private http:Firehttp,
        private firestore: AngularFirestore,
    ){
        this.db= environment.db.my_favorite;
    }

    /**
     * 
     * @param dataObj {user_uid, store_id, store_name, id, is_favorite, store_info}
     */
    getFavorite(dataObj){
        let obj={ref:null, show:false}
        obj.ref = this.firestore.collection(this.db).ref
        .where('uid','==', dataObj.user_uid )
        .where('store_id','==', dataObj.store_id );


        this.http.getByUid(obj, {
            success:function(data, mpageObj){
                if(data.length> 0){
                    dataObj.is_favorite = true;
                    dataObj.store_info =data[0];
                }
            },
            error:function(error){
            }
          })
    }

    /**
     * 
     * @param dataObj {user_uid, store_id, store_name, id, is_favorite, store_info}
     */
    favorite(dataObj){
        if(dataObj.is_favorite){
            this.deleteFavorite(dataObj)
        }else{
            this.addFavorite(dataObj);
        }
    }

    /**
     * 
     * @param dataObj : 
     * {user_uid, store_id, store_name, id, is_favorite, store_info}
     */
    addFavorite(dataObj){
        let addObj = {
            uid: dataObj.user_uid,
            store_id: dataObj.store_id,
            store_name: dataObj.store_name
        };
        this.http.create(this.db, addObj, {
            success: function(data){
                dataObj.is_favorite = true;
            }
        });
    }

    deleteFavorite(dataObj){
        this.http.delete(this.db, dataObj.store_info.id, {
            success: function(){
                dataObj.is_favorite = false;
            }
        })
    }


}
