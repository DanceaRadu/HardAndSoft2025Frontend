import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import * as THREE from 'three';
import { LidarData } from '../../models/lidar.model';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
  private controls!: OrbitControls;
  private pointCloud!: THREE.Points;
  private pointMaterial!: THREE.PointsMaterial;

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
    this.controls.dispose();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1F2937);

    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 0.7;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 10;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));

    this.pointMaterial = new THREE.PointsMaterial({
      color: 0x2563EB,
      size: 5,
      sizeAttenuation: false
    });

    this.pointCloud = new THREE.Points(geometry, this.pointMaterial);
    this.scene.add(this.pointCloud);

    const redPointGeometry = new THREE.BufferGeometry();
    const redPointVertices = new Float32Array([0, 0, 0]);
    redPointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(redPointVertices, 3));

    const redPointMaterial = new THREE.PointsMaterial({
      color: 0xFF0000,
      size: 5,
      sizeAttenuation: false
    });

    const redPoint = new THREE.Points(redPointGeometry, redPointMaterial);
    this.scene.add(redPoint);

    const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x888888);
    gridHelper.position.set(0, 0, -0.01);
    this.scene.add(gridHelper);

    this.animate();
  }

  private updatePointCloud(message: LidarData) {
    const points = message.ranges
      .filter(e => e !== -1 && e < 0.5)
      .map((range, index) => {
        const angle = (index - 40) * message.header.angle_increment;
        const x = range * Math.cos(angle);
        const y = range * Math.sin(angle);
        return { x, y };
      });

    const vertices = points.flatMap(point => [point.x, 0, point.y]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    this.pointCloud.geometry.dispose();
    this.pointCloud.geometry = geometry;

    this.pointMaterial.needsUpdate = true;
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
