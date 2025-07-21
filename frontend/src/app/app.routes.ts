import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ModeratorRoomComponent } from './components/moderator-room/moderator-room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'room/:id', component: ModeratorRoomComponent },
  { path: '**', redirectTo: '' }
];