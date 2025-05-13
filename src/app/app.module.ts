import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { RobotStatusComponent } from './components/robot-status/robot-status.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MatIcon } from '@angular/material/icon';
import { ConnectionStatusComponent } from './components/header/connection-status/connection-status.component';
import { CameraStreamComponent } from './components/camera-stream/camera-stream.component';
import { LidarVisualizerComponent } from './components/lidar-visualizer/lidar-visualizer.component';
import { MatIconButton } from '@angular/material/button';
import { LogPanelComponent } from './components/log-panel/log-panel.component';
import { LogEntryComponent } from './components/log-panel/log-entry/log-entry.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    RobotStatusComponent,
    MainPageComponent,
    ConnectionStatusComponent,
    CameraStreamComponent,
    LidarVisualizerComponent,
    LogPanelComponent,
    LogEntryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIcon,
    MatIconButton
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
