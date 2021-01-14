import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Subject } from "rxjs";
import { tap, shareReplay } from 'rxjs/operators';
import { GameService } from "./game.service";

@Injectable({providedIn:'root'})
export class AuthService implements CanActivate {

    isAuth: boolean = false;
    authStatusListener = new Subject<boolean>();

    constructor(private http:HttpClient, private router:Router, private gameService: GameService) {}

    login(username: string, password: string){
        return this.http.post<any>('/user/login', {username,password})
            .pipe(
                tap(response => {
                    localStorage.setItem('jwt_token', response.token);
                    this.isAuth = true;
                    this.authStatusListener.next(true);
                }), 
                shareReplay());
    } 

    register(username: string, password: string, email: string) {
        return this.http.post<any>('/user/register', {username,password,email});
    }

    logout() {
        this.isAuth = false;
        this.authStatusListener.next(false);
        this.gameService.closeConnection();
        localStorage.removeItem("jwt_token");
        window.location.reload();
    }

    getIsAuth() {
        return this.isAuth;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        if (this.isAuth)
            return true;
        
        return false;
    }

    verifyJwt() {
        return this.http.get('/user/verifyjwt');
    }

    resetPassReq(username: string) {
        return this.http.post('/user/forgetpassword', {username});
    }

    resetPassPost(password: string, token: string) {
        return this.http.post(`/user/reset/${token}`, {password});
    }

    getTopUsers(){
        return this.http.get('/user/topusers');
    }
}