import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//primeNG 會用到
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';

import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader} from "@ngx-translate/http-loader";


//========= custom module ============
import { PipeModule } from'../../projects/ogcat-tool-package/src/lib/_pipe/pipe.module';
import { OgcatToolPackageModule } from '../../projects/ogcat-tool-package/src/lib/ogcat-tool-package.module';//如果只使用到 function, factory 而沒使用到 component 則不需要 import

//======  component  ============
  //layout
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
  
//================ page ================================
//user
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ForgetPasswordComponent } from './user/forget-password/forget-password.component';
import { RouteUserComponent } from './sub-router/route-user/route-user.component';
import { StoreShowComponent } from './user/store-show/store-show.component'; 
import { MenuComponent } from './user/menu/menu.component';

//member
import { UpdatePasswordComponent } from './member/update-password/update-password.component';
import { MemberInfoComponent } from './member/member-info/member-info.component';
import { MyOrderComponent } from './member/my-order/my-order.component';

//store
import { CategoryComponent } from './store/category/category.component';
import { MenuEditComponent } from './store/menu-edit/menu-edit.component';
import { StoreEditComponent } from './store/store-edit/store-edit.component';
import { CustomerOrderComponent } from './store/customer-order/customer-order.component';


//================ .page ================================
//auth 驗證組件
import { authGuard } from './../authGuard';

//primeNG
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TabViewModule } from 'primeng/tabview';


//Angular Material
import { DragDropModule } from '@angular/cdk/drag-drop';

//pipe module
import { PipeModule1 } from './_pipe/pipe.module';


//customer-tool
import { Calendar } from './_factory/calendar';
import { PhotoComponent } from './photo/photo.component';

//environment
import { environment } from '../environments/environment';
import { PriceComponent } from './store/price/price.component';
import { ServiceWorkerModule } from '@angular/service-worker';

import { TeamOrderListComponent } from './user/team-order-list/team-order-list.component';
import { TeamMemberComponent } from './user/team-order-list/team-member/team-member.component';
import { TeamTotalComponent } from './user/team-order-list/team-total/team-total.component';
import { TeamInfoComponent } from './user/menu/team-info/team-info.component';
import { TeamBtntoolComponent } from './user/menu/team-btntool/team-btntool.component';
import { MyOrderTeamComponent } from './member/my-order-team/my-order-team.component';
import { MenuOnOffComponent } from './store/menu-on-off/menu-on-off.component';
import { MenuBoardComponent } from './store/menu-board/menu-board.component';
import { MyFavoriteComponent } from './member/my-favorite/my-favorite.component';
import { OffDayComponent } from './store/off-day/off-day.component';
import { OffDayShowComponent } from './user/off-day-show/off-day-show.component';
import { PrivacyComponent } from './page/privacy/privacy.component';


let i18nurl= environment.i18n;
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, i18nurl, ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent,
   
    RouteUserComponent,
   
    HeaderComponent,
    FooterComponent,
    
    MemberInfoComponent,
    MyOrderComponent,
    UpdatePasswordComponent,
    PhotoComponent,
    CategoryComponent,
    MenuEditComponent,
    MenuComponent,
    StoreShowComponent,
    StoreEditComponent,
    CustomerOrderComponent,
    PriceComponent,
    TeamOrderListComponent,
    TeamMemberComponent,
    TeamTotalComponent,
    TeamInfoComponent,
    TeamBtntoolComponent,
    MyOrderTeamComponent,
    MenuOnOffComponent,
    MenuBoardComponent,
    MyFavoriteComponent,
    OffDayComponent,
    OffDayShowComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule, 

    DragDropModule,
    FormsModule,
    PipeModule,
    PipeModule1,
    ReactiveFormsModule,
    OgcatToolPackageModule,
    ButtonModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    InputMaskModule,
    InputSwitchModule,
    TabViewModule,
    AutoCompleteModule,
    AngularFireModule.initializeApp(environment.firebase),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,//useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
        deps: [HttpClient]
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [authGuard, Calendar ],
  bootstrap: [AppComponent]
})
export class AppModule { }
 