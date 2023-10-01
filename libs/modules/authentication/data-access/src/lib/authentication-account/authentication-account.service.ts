import { Injectable } from '@angular/core';
import { GoogleAuthProvider, getAuth, signInWithPopup } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationAccountService {
  constructor() {}

  getAuthenticatedUser(): void {
    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user);
  }

  getToken() {
    // todo
  }

  signIn() {
    // todo
  }

  register() {
    // todo
  }

  async signInGoogle() {
    const provider = new GoogleAuthProvider();
    const credentials = await signInWithPopup(getAuth(), provider);
    console.log('credentials', credentials);
  }

  signOut() {
    // todo
  }

  changePassword() {
    // todo
  }

  resetPassword() {
    // todo
  }
}
