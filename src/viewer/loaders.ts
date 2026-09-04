import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { Stimulus } from "../types/study";
import { resolvePublicPath } from "../lib/paths";

export interface LoadedAsset {
  object: THREE.Object3D;
  boundingBox: THREE.Box3;
  dispose: () => void;
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const renderable = child as THREE.Mesh;
    if (!renderable.geometry || !renderable.material) return;
    renderable.geometry.dispose();
    const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

function createMaterial(stimulus: Stimulus, accent = false): THREE.MeshStandardMaterial {
  const variant = stimulus.hiddenVariantId.charCodeAt(stimulus.hiddenVariantId.length - 1) % 3;
  const colors = accent ? [0x707473, 0x686c6b, 0x787c7b] : [0xb9bbb9, 0xb2b5b3, 0xc0c2c0];
  return new THREE.MeshStandardMaterial({
    color: colors[variant],
    roughness: 0.72 - variant * 0.08,
    metalness: 0.04,
    flatShading: variant === 1,
  });
}

function createPlaceholder(stimulus: Stimulus): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(stimulus);
  const accent = createMaterial(stimulus, true);

  if (stimulus.placeholderShape === "figure") {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.95, 10, 22), material);
    body.position.y = -0.08;
    body.rotation.z = -0.08;
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 3), material);
    head.position.set(0.08, 0.93, 0.02);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 0.22, 32), accent);
    base.position.y = -1.13;
    group.add(body, head, base);
  } else if (stimulus.placeholderShape === "arch") {
    const pillarGeometry = new THREE.BoxGeometry(0.42, 1.55, 0.48, 4, 8, 4);
    const left = new THREE.Mesh(pillarGeometry, material);
    left.position.set(-0.65, -0.36, 0);
    left.rotation.z = -0.05;
    const right = new THREE.Mesh(pillarGeometry, material);
    right.position.set(0.65, -0.36, 0);
    right.rotation.z = 0.05;
    const curve = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.22, 14, 48, Math.PI), material);
    curve.rotation.z = Math.PI;
    curve.position.y = 0.43;
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.72), accent);
    base.position.y = -1.18;
    group.add(left, right, curve, base);
  } else if (stimulus.placeholderShape === "spire") {
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.62, 1.55, 7), material);
    lower.position.y = -0.36;
    lower.rotation.y = 0.2;
    const upper = new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.25, 7), material);
    upper.position.y = 0.98;
    upper.rotation.y = -0.1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.09, 10, 32), accent);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.27;
    group.add(lower, upper, ring);
  } else {
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.62, 0.21, 150, 24), material);
    knot.rotation.x = 0.35;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.82, 0.2, 32), accent);
    base.position.y = -1.02;
    group.add(knot, base);
  }

  return group;
}

function loadGlb(path: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(path, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

async function loadObj(stimulus: Stimulus): Promise<THREE.Object3D> {
  const loader = new OBJLoader();
  if (stimulus.mtlPath) {
    const mtlUrl = resolvePublicPath(stimulus.mtlPath);
    const directory = mtlUrl.slice(0, mtlUrl.lastIndexOf("/") + 1);
    const filename = mtlUrl.slice(mtlUrl.lastIndexOf("/") + 1);
    const materials = await new Promise<ReturnType<MTLLoader["parse"]>>((resolve, reject) => {
      new MTLLoader().setPath(directory).setResourcePath(directory).load(filename, resolve, undefined, reject);
    });
    materials.preload();
    loader.setMaterials(materials);
  }

  return new Promise((resolve, reject) => {
    loader.load(resolvePublicPath(stimulus.assetPath), resolve, undefined, reject);
  });
}

interface RendererAdapter {
  load: (stimulus: Stimulus, renderer: THREE.WebGLRenderer, scene: THREE.Scene) => Promise<LoadedAsset>;
}

const MeshRenderer: RendererAdapter = {
  async load(stimulus) {
    const content = stimulus.assetType === "glb"
      ? await loadGlb(resolvePublicPath(stimulus.assetPath))
      : await loadObj(stimulus);
    const object = new THREE.Group();
    object.add(content);
    return {
      object,
      boundingBox: new THREE.Box3().setFromObject(object),
      dispose: () => disposeObject(content),
    };
  },
};

const SplatRenderer: RendererAdapter = {
  async load(stimulus, renderer, scene) {
    if (!renderer.capabilities.isWebGL2) {
      throw new Error("Gaussian splats require WebGL 2.");
    }
    const { SparkRenderer, SplatMesh } = await import("@sparkjsdev/spark");
    const sparkRenderer = new SparkRenderer({ renderer });
    const splatMesh = new SplatMesh({ url: resolvePublicPath(stimulus.assetPath) });
    const object = new THREE.Group();
    object.add(splatMesh);
    scene.add(sparkRenderer, object);
    try {
      await splatMesh.initialized;
    } catch (error) {
      scene.remove(object, sparkRenderer);
      splatMesh.dispose();
      sparkRenderer.dispose();
      throw error;
    }
    return {
      object,
      boundingBox: splatMesh.getBoundingBox(false),
      dispose: () => {
        scene.remove(object, sparkRenderer);
        splatMesh.dispose();
        sparkRenderer.dispose();
      },
    };
  },
};

export async function loadStudyAsset(
  stimulus: Stimulus,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
): Promise<LoadedAsset> {
  if (stimulus.isPlaceholder) {
    const object = createPlaceholder(stimulus);
    return {
      object,
      boundingBox: new THREE.Box3().setFromObject(object),
      dispose: () => disposeObject(object),
    };
  }

  return (stimulus.rendererType === "splat" ? SplatRenderer : MeshRenderer)
    .load(stimulus, renderer, scene);
}

export function normalizeObject(
  object: THREE.Object3D,
  boundingBox: THREE.Box3,
  initialRotation: [number, number, number] = [0, 0, 0],
): void {
  if (boundingBox.isEmpty()) throw new Error("The loaded asset has no visible bounds.");
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
    throw new Error("The loaded asset has invalid dimensions.");
  }
  const scale = 2.35 / maxDimension;
  object.scale.setScalar(scale);
  object.rotation.set(...initialRotation);
  object.position.copy(center.multiplyScalar(scale).applyEuler(object.rotation).multiplyScalar(-1));
  object.updateMatrixWorld(true);
}
