import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';

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
import { TestService } from './test.service';
import { BlocksComponent } from './blocks/blocks.component';
import { BlocksService } from './blocks.service';
import { StringService } from './string.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    MusicComponent,
    LoaderComponent,
    BlocksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DragDropModule
  ],
  providers: [
    MusicService,
    WorkspaceService,
    TestService,
    BlocksService,
    StringService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
