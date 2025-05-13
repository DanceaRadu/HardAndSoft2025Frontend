import { Component, ElementRef, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import * as THREE from 'three';
import { LidarData } from '../../models/lidar.model';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LogMessage } from '../../models/log-message.model';

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

  private currentRobotX: number = 0;
  private currentRobotY: number = 0;

  private redPointGeometry!: THREE.BufferGeometry;
  private redPointVertices!: Float32Array;
  private redPointMaterial!: THREE.PointsMaterial;
  private redPoint!: THREE.Points;

  ngOnInit(): void {
    this.initThree();
    this.websocketService.getMessages().subscribe(message => {
      if(message.type == 'lidar') {
        this.updatePointCloud(message)
      } else if (message.type == "log") {
        this.handleLogMessage(message)
      }
    })
  }

  ngOnDestroy() {
    this.renderer.dispose();
    this.controls.dispose();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
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

    this.redPointGeometry = new THREE.BufferGeometry();
    this.redPointVertices = new Float32Array([0, 0, 0]);
    this.redPointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.redPointVertices, 3));
    this.redPointMaterial = new THREE.PointsMaterial({
      color: 0xFF0000,
      size: 7,
      sizeAttenuation: false
    });
    this.redPoint = new THREE.Points(this.redPointGeometry, this.redPointMaterial);
    this.scene.add(this.redPoint);

    const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x888888);
    gridHelper.position.set(0, 0, -0.01);
    this.scene.add(gridHelper);

    this.animate();
  }

  private updatePointCloud(message: LidarData) {
    if(message.robot_x && message.robot_y) {
      this.currentRobotX = message.robot_x;
      this.currentRobotY = message.robot_y;
      const positionAttribute = this.redPointGeometry.getAttribute('position');
      positionAttribute.setXYZ(0, this.currentRobotX, 0, this.currentRobotY);
      positionAttribute.needsUpdate = true;
    }

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

  handleLogMessage(message: LogMessage) {
    let assetPath = '';
    if(message.logType === "vibration") {
      assetPath = '/assets/vibration-sprite.png';
    } else if(message.logType === "alcohol") {
      assetPath = '/assets/bottle-sprite.png';
    } else if(message.logType === "magnetic") {
      assetPath = '/assets/finish-sprite.png';
    } else {
      return;
    }

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(assetPath);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(this.currentRobotX, 0, this.currentRobotY);
    sprite.scale.set(0.1, 0.1, 1);
    this.scene.add(sprite);
  }
}
