import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { LidarData } from '../../models/robot-status.model';
import * as THREE from 'three';

@Component({
  selector: 'app-lidar-visualizer',
  standalone: false,
  templateUrl: './lidar-visualizer.component.html',
  styleUrl: './lidar-visualizer.component.scss'
})
export class LidarVisualizerComponent implements OnInit, OnDestroy {
  constructor(private websocketService: WebsocketService) {}

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private pointCloud!: THREE.Points;

  ngOnInit(): void {
    this.initThree();
    this.websocketService.getMessages().subscribe(message => {
      if(message.type == 'lidar') {
        this.updatePointCloud(message)
      }
    })
  }

  ngOnDestroy() {
    this.renderer.dispose();
  }

  private updatePointCloud(message: LidarData) {
    let points = message.points
    const vertices = points.flatMap(point => [point.x, point.y, 0]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.pointCloud.geometry.dispose();
    this.pointCloud.geometry = geometry;
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1F2937);

    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0x2563EB,
      size: 0.1,
    });

    this.pointCloud = new THREE.Points(geometry, material);
    this.scene.add(this.pointCloud);

    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }


}
