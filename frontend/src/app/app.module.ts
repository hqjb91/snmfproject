import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthInterceptor } from './services/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/user/login.component';
import { RegisterComponent } from './components/user/register.component';
import { ProfileComponent } from './components/main/profile.component';
import { GameComponent } from './components/main/game.component';
import { DiscussionComponent } from './components/discussion/discussion.component';
import { HomeComponent } from './components/home.component';

import { Globals } from './models/globals';
import { NavbarComponent } from './components/navbar.component';
import { CreatePostComponent } from './components/discussion/create-post.component';
import { PostListComponent } from './components/discussion/post-list.component';
import { PassResetReqComponent } from './components/user/pass-reset-req.component';
import { PassResetPostComponent } from './components/user/pass-reset-post.component';

@NgModule({
  declarations: [
    AppComponent, LoginComponent,
    RegisterComponent, ProfileComponent,
    GameComponent, DiscussionComponent, HomeComponent, NavbarComponent, CreatePostComponent, PostListComponent, PassResetReqComponent, PassResetPostComponent
  ],
  imports: [
    BrowserModule, AppRoutingModule,
    FormsModule, ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
		Globals.injector = injector
	}
 }
