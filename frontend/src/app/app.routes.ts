import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { MenuComponent } from './pages/menu/menu';
import { About } from './pages/about/about';
import { BookingComponent } from './pages/booking/booking';
import {privacy as p} from './pages/privacy/privacy';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'chi-siamo', component: About },
  { path: 'prenota', component: BookingComponent },
  {path: 'privacy' , component: p},
  { path: '**', redirectTo: '' }
];
