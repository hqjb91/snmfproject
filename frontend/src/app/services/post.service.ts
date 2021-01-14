import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface Post {
    title: string;
    post: string;
    username: string;
}

@Injectable({providedIn:'root'})
export class PostService {

    postCreated: Subject<boolean> = new Subject<boolean>();

    constructor(private http:HttpClient){ }

    submitPost(username: string, title: string, post: string) {
        const bodyData = { username, title, post };
        return this.http.post<any>('/posts/post', bodyData);
    }

    getPosts(limit: string, offset: string){
        const queryParams = new HttpParams().set('limit', limit).set('offset', offset)
        return this.http.get<any>('/posts/post', {params: queryParams});
    }
}