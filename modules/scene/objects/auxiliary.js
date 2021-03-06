import DPR from 'dpr';
import {ArrowHelper, CylinderBufferGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3} from 'three';
import {createMeshLineGeometry} from './meshLine';

export function createArrow(length, arrowLength, arrowHead, axis, color, opacity, materialMixins) {
  let arrow = new ArrowHelper(new Vector3().copy(axis), new Vector3(0, 0, 0), length, color, arrowLength, arrowHead);
  arrow.updateMatrix();
  arrow.line.material.linewidth = 1 / DPR;
  if (opacity !== undefined) {
    arrow.line.material.opacity = opacity;
    arrow.line.material.transparent = true;
    arrow.cone.material.opacity = opacity;
    arrow.cone.material.transparent = true;
  }
  if (materialMixins !== undefined) {
    Object.assign(arrow.line.material, ...materialMixins);
    Object.assign(arrow.cone.material, ...materialMixins);
  }
  return arrow;
}

let tipGeometry = null;
let lineGeometry = null;

export class MeshArrow extends Object3D {

  constructor(dir, color, length, headLength, headWidth, lineWidth) {
    super();

    if (color === undefined) color = 0xffff00;
    if (length === undefined) length = 1;
    if (headLength === undefined) headLength = 0.2 * length;
    if (headWidth === undefined) headWidth = 0.2 * headLength;
    if (lineWidth === undefined) lineWidth = 0.2 * headWidth;

    if (!tipGeometry) {
      tipGeometry = new CylinderBufferGeometry(0, 0.5, 1, 5, 1);
      tipGeometry.translate(0, -0.5, 0);
      lineGeometry = createMeshLineGeometry([[0, 0, 0], [0, 1, 0]], 1);
    }

    // dir is assumed to be normalized

    let cone = new Mesh(tipGeometry, new MeshBasicMaterial({color}));
    let line = new Mesh(lineGeometry, new MeshBasicMaterial({color}));

    line.matrixAutoUpdate = false;
    cone.matrixAutoUpdate = false;

    this.add(line);
    this.add(cone);

    if (dir.y > 0.99999) {
      this.quaternion.set(0, 0, 0, 1);
    } else if (dir.y < -0.99999) {
      this.quaternion.set(1, 0, 0, 0);
    } else {
      let axis = new Vector3();
      let radians;
      axis.set(dir.z, 0, -dir.x).normalize();
      radians = Math.acos(dir.y);
      this.quaternion.setFromAxisAngle(axis, radians);
    }

    line.scale.set(lineWidth, Math.max(0, length - headLength), lineWidth);
    line.updateMatrix();

    cone.scale.set(headWidth, headLength, headWidth);
    cone.position.y = length;
    cone.updateMatrix();
    
    this.cone = cone;
    this.line = line;
  }
  
  dispose() {
    this.cone.material.dispose();
    this.line.material.dispose();
  }
}
