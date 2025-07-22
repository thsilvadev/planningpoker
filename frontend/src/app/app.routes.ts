import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ModeratorRoomComponent } from './components/moderator-room/moderator-room.component';
import { ParticipantRoomComponent } from './components/participant-room/participant-room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'moderate-room/:id', component: ModeratorRoomComponent },
  { path: 'participant-room/:id', component: ParticipantRoomComponent },
  { path: '**', redirectTo: '' }
];