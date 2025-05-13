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
  private pointMaterial!: THREE.PointsMaterial;
  private robotSprite!: THREE.Sprite;
  private maxCanvasSize = 1000;

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

    this.adjustCameraToFitPoints(points);
    this.adjustPointSize();
  }

  private adjustPointSize() {
    const canvasWidth = this.rendererContainer.nativeElement.clientWidth;
    const canvasHeight = this.rendererContainer.nativeElement.clientHeight;

    const sizeFactor = (Math.min(canvasWidth, canvasHeight) * 10) / this.maxCanvasSize;
    this.pointMaterial.size = Math.max(0.1, sizeFactor * 0.5);
    this.pointMaterial.needsUpdate = true;
  }

  private adjustCameraToFitPoints(points: { x: number; y: number }[]) {
    const boundingBox = new THREE.Box3();
    points.forEach(point => {
      boundingBox.expandByPoint(new THREE.Vector3(point.x, point.y, 0));
    });

    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    const maxDimension = Math.max(size.x, size.y);
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = (maxDimension / 2) / Math.tan(fov / 2);

    this.camera.position.set(center.x, center.y, distance * 1.5);
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();

    if (this.robotSprite) {
      //this.robotSprite.position.set(center.x, center.y, 0);
    }
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
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));

    this.pointMaterial = new THREE.PointsMaterial({
      color: 0x2563EB,
      size: 0.5,
      sizeAttenuation: false
    });

    this.pointCloud = new THREE.Points(geometry, this.pointMaterial);
    this.scene.add(this.pointCloud);

    this.addCenterSprite();

    this.animate();
  }

  private addCenterSprite() {
    const textureLoader = new THREE.TextureLoader();
    const iconTexture = textureLoader.load('assets/robot-sprite.png');

    const spriteMaterial = new THREE.SpriteMaterial({
      map: iconTexture,
      sizeAttenuation: false,
      transparent: true,
      opacity: 1,
    });

    this.robotSprite = new THREE.Sprite(spriteMaterial);
    this.robotSprite.scale.set(0.2, 0.2, 0.2);
    this.robotSprite.position.set(0, 0, 0);
    this.scene.add(this.robotSprite);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
