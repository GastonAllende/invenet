import { Component } from '@angular/core';
import { AuthTailwindExampleComponent } from '../auth-tailwind-example.component';

@Component({
  selector: 'lib-auth',
  imports: [AuthTailwindExampleComponent],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {}
