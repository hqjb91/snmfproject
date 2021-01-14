import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { LoginComponent } from './components/user/login.component';
import { RegisterComponent } from './components/user/register.component';
import { PassResetReqComponent } from './components/user/pass-reset-req.component';
import { PassResetPostComponent } from './components/user/pass-reset-post.component';
import { ProfileComponent } from './components/main/profile.component';
import { DiscussionComponent } from './components/discussion/discussion.component';
import { GameComponent } from './components/main/game.component';
import { AuthService } from './services/auth.service';

const routes: Routes = [
  { path:'', component: HomeComponent},
  { path:'login', component: LoginComponent },
  { path:'register', component: RegisterComponent },
  { path:'profile', component: ProfileComponent, canActivate: [AuthService] },
  { path:'discussion', component: DiscussionComponent, canActivate: [AuthService] },
  { path:'game', component: GameComponent, canActivate: [AuthService] },
  { path:'reset-req', component: PassResetReqComponent },
  { path:'reset/:token', component: PassResetPostComponent },
  { path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
