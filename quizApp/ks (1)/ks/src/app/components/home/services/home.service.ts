import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  user: any = {};
  serverUrl = environment.serverURL;
  constructor(private http: HttpClient) {}

  getQuizzes() {
    return this.http.get(`${this.serverUrl}quiz/getQuizzes`);
  }

  checkIfPlayed(quiz: any) {
    // console.log('quiz details',quiz)
    this.user.userId = localStorage.getItem("userId");
    this.user.quizId = quiz._id;
    return this.http.post(`${this.serverUrl}quiz/check-if-played`, this.user);
  }
}
