import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  form: FormGroup;
  username: string;

  constructor(private fb: FormBuilder, private postService: PostService, private gameService: GameService, private router: Router) { }

  ngOnInit(): void {
    this.username = this.gameService.username;
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.min(5), Validators.max(30)]],
      post: ['', [Validators.required, Validators.min(5), Validators.max(100)]]
    });
  }

  processForm() {
    this.postService.submitPost(this.username, this.form.get('title').value, this.form.get('post').value)
      .subscribe( resp => {
        console.log(resp);
        this.postService.postCreated.next(true);
      } );
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  } 

  clearForm(){
    this.form.reset();
  }

}
