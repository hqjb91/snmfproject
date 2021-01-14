import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostService, Post } from 'src/app/services/post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  postLists: Post[] = [];
  postCreatedListener$: Subscription;
  limit: number = 5;
  offset: number = 0;
  maxCount: number = 5;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.postCreatedListener$ = this.postService.postCreated.asObservable().subscribe( event => {
      this.postService.getPosts(this.limit.toString(), this.offset.toString()).subscribe(resp => { this.postLists = resp.data });
    });
    this.postService.getPosts(this.limit.toString(), this.offset.toString()).subscribe(resp => { this.postLists = resp.data, this.maxCount = resp.count });
  }

  ngOnDestroy() {
    this.postCreatedListener$.unsubscribe();
  }

  previous() {
    this.offset -= this.limit;
    this.postService.getPosts(this.limit.toString(), this.offset.toString()).subscribe(resp => { this.postLists = resp.data, this.maxCount = resp.count });
  }

  next() {
    this.offset += this.limit;
    this.postService.getPosts(this.limit.toString(), this.offset.toString()).subscribe(resp => { this.postLists = resp.data, this.maxCount = resp.count });
  }

}
