import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-auth-feature',
  imports: [RouterModule],
  templateUrl: './auth-feature.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth-feature.css',
})
export class AuthFeature {}
