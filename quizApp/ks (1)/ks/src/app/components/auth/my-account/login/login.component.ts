import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { validateAllFormFields } from "src/app/utils/validateform";
// import { HomePageService } from '../../shop/services/home-page.service';
import { Router } from "@angular/router";
import { LoaderService } from "src/app/components/shared/services/loader.service";
import { AuthService } from "../../services/auth.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide: Boolean = true;
  authModel: any;
  constructor(
    public router: Router,
    private loaderService: LoaderService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }
  createForm() {
    this.loginForm = new FormGroup({
      emailAddress: new FormControl(null, []),
      password: new FormControl(null, []),
    });
  }
  login() {
    validateAllFormFields(this.loginForm);

    this.loaderService.showLoader();
    if (!this.loginForm.valid) {
      return;
    } else {
      this.authModel = this.loginForm.value;

      this.authService.login(this.authModel).subscribe({
        next: (response: any) => {
          if (response.statusCode == 200) {
            localStorage.setItem("userId", response.user._id);
            console.log("userId", response);
            this.loginForm.reset();

            this.router.navigate(["/home/dashboard"]);
          } else {
            this.loginForm.reset();

            localStorage.setItem("userId", response.user._id);

            console.log("rec");
            this.router.navigate(["/home/dashboard"]);

            console.log(response);
          }
          this.loaderService.hideLoader();
        },
        error: (err: any) => {
          console.log();
          Swal.fire(err.error.message);
        },
        complete: () => {
          this.authModel = {};
        },
      });
    }
  }
  // showPassword() {
  //   this.hide = !this.hide
  // }
}
