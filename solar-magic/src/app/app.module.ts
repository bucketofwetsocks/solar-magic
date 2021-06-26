import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { MusicComponent } from './music/music.component';
import { MusicService } from './music.service';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './loader/loader.component';
import { FormsModule, NgModel } from '@angular/forms';
import { WorkspaceService } from './workspace.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    MusicComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    MusicService,
    WorkspaceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
