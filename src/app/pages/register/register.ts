import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  form = new FormGroup({
    fullName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });

  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

 async createAccount() {
  const fullName = this.form.value.fullName!;
  const email = this.form.value.email!;
  const password = this.form.value.password!;

  // 1. Create user in Supabase Auth
  const { data, error } = await this.supabase.signUpWithEmail({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error || !data.user) {
    alert(error?.message ?? 'An unknown error occurred');
    return;
  }

  const user = data.user;

  // 2. Insert into profiles table
  await this.supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName
    });

  // 3. Redirect
  this.router.navigate(['/login']);
}
}
