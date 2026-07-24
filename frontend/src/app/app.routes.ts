import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MenuComponent } from './pages/menu/menu';
import { About } from './pages/about/about';
import {privacy as p} from './pages/privacy/privacy';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'menu', component: MenuComponent },
  { path: 'chi-siamo', component: About },
  {path: 'privacy' , component: p},
  { path: '**', redirectTo: '' }
];
