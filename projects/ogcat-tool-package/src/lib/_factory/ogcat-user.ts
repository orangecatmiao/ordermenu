import { Injectable } from '@angular/core';

@Injectable()


export class OgcatUser {
    
    setUserInfo(info){
       
        let userInfo = {
            displayName: info.displayName,
            email: info.email,
            emailVerified: info.emailVerified,
            metadata: info.metadata,
            uid: info.uid,
            photoURL:info.photoURL
        }
       
        localStorage.setItem("userInfo", JSON.stringify(userInfo) );
        return userInfo;
    }
}
