import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms'
import { SupabaseService } from '../../services/supabase.service';
import { authUser } from '../../store/auth.store';
import { authProfile } from '../../store/auth.store';


@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

  export class LoginComponent {
    form = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    });
    loading = signal(false);
    private readonly supabaseService = inject(SupabaseService);
    private readonly router = inject(Router);

    async signInWithEmail() {
      const { data, error } = await this.supabaseService.signInWithEmail({
        email: this.form.value.email!,
        password: this.form.value.password!,
      });

      if (error) {
        alert('Error signing in: ' + error.message);
        return;
      }

      // 1. Save user
      const { data: userData } = await this.supabaseService.getUser();
      const user = userData.user;
      authUser.set(user);

      // 2. Load profile
      const { data: profile } = await this.supabaseService
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      authProfile.set(profile);

      // 3. Redirect
      this.router.navigate(['/home']);
    }

}
