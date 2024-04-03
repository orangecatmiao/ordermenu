import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Sub-Router
import { RouteUserComponent } from './sub-router/route-user/route-user.component';

//Login/Register/Forgetpassword
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ForgetPasswordComponent } from './user/forget-password/forget-password.component';


//user
import { MenuComponent } from './user/menu/menu.component';
import { StoreShowComponent } from './user/store-show/store-show.component';
import { TeamOrderListComponent } from './user/team-order-list/team-order-list.component';
import { OffDayShowComponent } from './user/off-day-show/off-day-show.component';

//會員中心
import { MemberInfoComponent } from './member/member-info/member-info.component';
import { UpdatePasswordComponent } from './member/update-password/update-password.component';
import { MyOrderComponent } from './member/my-order/my-order.component';
import { MyOrderTeamComponent } from './member/my-order-team/my-order-team.component';
import { MyFavoriteComponent } from './member/my-favorite/my-favorite.component';

//store
import { StoreEditComponent } from './store/store-edit/store-edit.component';
import { CategoryComponent } from './store/category/category.component';
import { PriceComponent } from './store/price/price.component';
import { MenuEditComponent } from './store/menu-edit/menu-edit.component';
import { CustomerOrderComponent } from './store/customer-order/customer-order.component';
import { MenuOnOffComponent } from './store/menu-on-off/menu-on-off.component';
import { MenuBoardComponent } from './store/menu-board/menu-board.component';
import { OffDayComponent } from './store/off-day/off-day.component';


//page
import { PrivacyComponent } from './page/privacy/privacy.component';

//authGuard
import { authGuard } from './../authGuard';


let user="user";
let member="member";
let store="store";
let page="page";
let admin="admin";

const routes: Routes = [
  { path: '', redirectTo: '/user/login', pathMatch: 'full' }, 
  { path: user, component: RouteUserComponent,
    children: [
        //註冊
        { path: 'register',  component: RegisterComponent  },
        { path: 'login',  component: LoginComponent },
        { path: 'forget-password',  component: ForgetPasswordComponent },
        { path: 'menu',  component: MenuComponent },
        { path: 'menu/:id',  component: MenuComponent },
        { path: 'menu/:id/:team_order_id',  component: MenuComponent },
        { path: 'store-show/:id',  component: StoreShowComponent },
        { path: 'team-order-list',  component: TeamOrderListComponent },
        { path: 'team-order-list/:id',  component: TeamOrderListComponent },
        { path: 'team-order-list/:id/:team_order_id',  component: TeamOrderListComponent },
        { path: 'off-day-show',  component: OffDayShowComponent },
        { path: 'off-day-show/:id',  component: OffDayShowComponent },//id: store_id
        
    ]
  },
  { path: member, component: RouteUserComponent,
    children: [
        { path: 'member-info',  component: MemberInfoComponent, canActivate: [authGuard]  },
        { path: 'update-password',  component: UpdatePasswordComponent, canActivate: [authGuard]  },
        { path: 'my-favorite',  component: MyFavoriteComponent, canActivate: [authGuard]  },
        { path: 'my-order',  component: MyOrderComponent, canActivate: [authGuard]  },
        { path: 'my-order/:id',  component: MyOrderComponent, canActivate: [authGuard]  },
        { path: 'my-order-team',  component: MyOrderTeamComponent, canActivate: [authGuard]  },
    ]
  },
  { path: store, component: RouteUserComponent,
    children: [
      { path: 'store-edit',  component: StoreEditComponent, canActivate: [authGuard]  },
      { path: 'off-day',  component: OffDayComponent, canActivate: [authGuard]  },
      { path: 'category',  component: CategoryComponent, canActivate: [authGuard]  },
      { path: 'price',  component: PriceComponent, canActivate: [authGuard]  },
      { path: 'menu-edit',  component: MenuEditComponent, canActivate: [authGuard]  },
      { path: 'customer-order',  component: CustomerOrderComponent, canActivate: [authGuard]  },
      { path: 'customer-order/:id',  component: CustomerOrderComponent, canActivate: [authGuard]  },
      { path: 'menu-on-off',  component: MenuOnOffComponent, canActivate: [authGuard]  },
      { path: 'menu-board',  component: MenuBoardComponent, canActivate: [authGuard]  },
    ]
  },
  { path: page, component: RouteUserComponent,
    children: [
        { path: 'privacy',  component: PrivacyComponent  },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
