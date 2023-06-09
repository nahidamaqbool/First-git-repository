import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { QuizService } from "../services/quiz.service";
import { findIndex, interval, Subscription, pipe, BehaviorSubject } from "rxjs";
// import { Resolve } from "@angular/router";
import { promise } from "protractor";
import { threadId } from "worker_threads";
import { sum } from "pdf-lib";


@Component({
  selector: "app-attempt-team-quiz",
  templateUrl: "./attempt-team-quiz.component.html",
  styleUrls: ["./attempt-team-quiz.component.scss"],
})
export class AttemptTeamQuizComponent implements OnInit {
  allTeamsParicipated = false;
  teamQuizDetail: any = {};
  totalTeams: any = 0;
  teamsThatEntered: any = 0
  subscription: Subscription;
  assignQuizToSelectedTeam: Subscription
  quizStarted = false
  team: any = {}
  questionNo: number = 0;
  question: any = {};
  options: any = [];
  savedResponse: any = {};
  responses: any = [];

  warning = true;
  waitingForTurn = false;

  // handle round
  breaktime: boolean = false
  teamsOfTheQuiz = []
  totalroundsinQuiz: number
  roundNumber = 0
  teamtoplayquiz: any = {}
  teamsthatplayedthisround = []
  teamId: any;
  play: boolean = false
  totalTeamsplayed = 1;
  public teamIndex: number = 0;
  totalQuestions = 0;
  mediaUrl: any;
  totalTime: any;
  minutes: any;
  seconds: number;
  remainSeconds: number;
  intervalId: any;
  totalRound: number = 2;
  playedRound = 1;
  totalQuestionsPerRound: number = 3
  questionAttempted:number;
  // intervalId: NodeJS.Timeout;
  public callPlayNow = new BehaviorSubject<any>({});
  


  constructor(
    private dialog: MatDialog,
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.teamQuizDetail.quizId = this.route.snapshot.params.quizId;
    this.teamQuizDetail.organizedQuizId =
      this.route.snapshot.params.organizedQuizId;
    this.teamQuizDetail.teamId = this.route.snapshot.params.teamId;
    // this.getQuestion();
    this.getTotalTeamsInQuiz();



    this.subscription = interval(1200).subscribe(
      (res: any) => {
        if (this.teamsThatEntered < this.totalTeams) {

          this.quizService.enteredQuiz(this.teamQuizDetail).subscribe(
            (res: any) => {
              // console.log(res,"---")

              if (this.teamsThatEntered === this.totalTeams) {

                this.allTeamsParicipated = true;


              }
              this.teamsThatEntered = res
              // console.log('teamsentered',this.teamsThatEntered,this.totalTeams,'total teams')


            },
            (error) => { },
            () => { }
          );
        } else {
          this.subscription.unsubscribe();

          this.getTeamsLoggedInForQuiz()
          this.warning = false;
          this.waitingForTurn = true;



        }
      },
      (error) => {
        Swal.fire(error.error.message);
      },
      () => { }
    );

  }

  getTotalTeamsInQuiz() {
    this.quizService.getTotalTeamsInQuiz(this.teamQuizDetail).subscribe(
      (res) => {
        this.totalTeams = res;
      },
      (error) => { },
      () => { }
    );
  }


  getTeamsLoggedInForQuiz() {

    this.teamtoplayquiz.quizId = this.route.snapshot.params.quizId;
    this.teamtoplayquiz.organizedQuizId =
      this.route.snapshot.params.organizedQuizId;
    this.quizService.teamToPlayQuiz(this.teamtoplayquiz).subscribe((res) => {
      this.team = res;
      // this.questionAttempted=this.totalQuestionsPerRound
      this.start_quiz()
    });


  }


  start_quiz() {

    if (this.route.snapshot.params.teamId === this.team[this.teamIndex].teamId) {
      this.getQuestion();

    }

    this.callPlayNow.subscribe(() => {
      setTimeout(() => {

        this.playnow();

      }, 300);
    })



  }






  playnow() {


    if (this.route.snapshot.params.teamId === this.team[this.teamIndex].teamId) {



      this.waitingForTurn = false;
      this.play = true
      this.allTeamsParicipated = true;

      this.timer()


    }


    if (this.teamIndex <= this.totalTeams) {



      this.assignQuizToSelectedTeam = interval(20000).subscribe(

        (res: any) => {
          this.questionNo=0;

          this.play = false
          this.allTeamsParicipated = false;
          this.waitingForTurn = true;

          this.teamIndex++;
          




          if (this.teamIndex < this.totalTeams) {
            this.assignQuizToSelectedTeam.unsubscribe();


            this.start_quiz()

          }
          else {
            if (this.playedRound < this.totalRound) {

              this.assignQuizToSelectedTeam.unsubscribe();

              this.teamIndex = 0;
              this.playedRound++

              this.start_quiz()




            }
          }





        })
    }




  }











  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.assignQuizToSelectedTeam.unsubscribe();

  }


  getQuestion() {

    this.quizService.getQuestionForTeams(this.questionNo, this.route.snapshot.params.quizId).subscribe(
      (res: any) => {
        console.log(res)
        this.question = res;

        this.options = res.question.questionBank[0].options;
        this.totalQuestions = res.question.totalQuestions;
        this.mediaUrl = res.question.questionBank[0].fileUrl;
        this.totalTime = res.question.totalTime
        this.questionNo++;


      },
      (error) => {
        Swal.fire(error.message);
        this.router.navigate(["/home/dashboard"]);
      },
    );


  }


  



  saveResponse() {
    
    this.savedResponse.questionId = this.question.question.questionBank[0]._id;
    this.responses.push(this.savedResponse);
    this.savedResponse = {};

    if (this.questionNo < this.totalQuestionsPerRound)
     {
       this.getQuestion();

     }

    
    }






  





  timer() {
    this.minutes = this.totalTime;

    this.seconds = this.minutes * 60;
    this.remainSeconds = 0;
    this.intervalId = setInterval(() => {
      this.seconds = this.seconds - 1;
      this.minutes = Math.floor(this.seconds / 60);
      this.remainSeconds = this.seconds % 60;
      if (this.seconds == 0) {
        // this.submitResponse();
        clearInterval(this.intervalId);
      }
    }, 1000);
    // if(this.minutes == 0)
    // {
    //   this.playnow()
    // }
  }




  submitResponse() {

  }




}
