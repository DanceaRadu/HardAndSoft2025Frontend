import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { RobotStatusComponent } from './components/robot-status/robot-status.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MatIcon } from '@angular/material/icon';
import { ConnectionStatusComponent } from './components/header/connection-status/connection-status.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    RobotStatusComponent,
    MainPageComponent,
    ConnectionStatusComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIcon
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
