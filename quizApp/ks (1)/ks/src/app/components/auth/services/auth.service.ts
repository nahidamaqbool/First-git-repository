import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";
import { shareReplay, tap } from "rxjs/operators";
import { BehaviorSubject, pipe } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class AuthService {
  user: any = {};
  serverUrl = environment.serverURL;
  loggedUserDetail: any = {};
  enableProfile = "true";

  public userDetails = new BehaviorSubject<any>({});

  constructor(private http: HttpClient) {}

  register(userModel: any) {
    if(!userModel.role)
    userModel.role='user'
    return this.http.post(`${this.serverUrl}auth/sign-up`, userModel);
  }

  login(authModel: any) {
    return this.http.post(`${this.serverUrl}auth/login`, authModel).pipe(
      tap((res) => this.setSession(res)),
      shareReplay()
    );
  }

  private setSession(authResult) {
    this.loggedUserDetail = authResult;
    localStorage.setItem("enableProfile", this.enableProfile);
    localStorage.setItem("userRole", this.loggedUserDetail.user.role);
    localStorage.setItem("firstName", this.loggedUserDetail.user.firstName);
    localStorage.setItem("lastName", this.loggedUserDetail.user.lastName);

    this.userDetails.next(this.loggedUserDetail);
    const expiresAt = moment().add(authResult.expiresIn, "minutes");
    localStorage.setItem("accessToken", authResult.accessToken);
    localStorage.setItem("expires_at", authResult.expiresIn);
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("userRole");
    localStorage.removeItem("enableProfile");
    localStorage.removeItem("userId");
    // this.loggedUserDetail.enableProfile= false;
    this.userDetails.next(this.loggedUserDetail);
  }
  public isLoggedIn() {
    // return moment().isBefore(this.getExpiration());
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) return true;
    else return false;
  }
  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  getLoggedUser(userId: any) {
    return this.http.post(`${this.serverUrl}auth/getLoggedUser`, userId);
  }

  update(user: any) {
    return this.http.put(`${this.serverUrl}auth/update`, user);
  }

  getOrganizations() {
    return this.http.get(`${this.serverUrl}auth/get-organizations`);
  }
}
