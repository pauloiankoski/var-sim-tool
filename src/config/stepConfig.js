/**
 * Step configuration for the VAR simulation tool
 * Centralizes step metadata and validation logic
 */

import { Step } from '../store/appReducer';
import ImageUpload from '../components/ImageUpload';
import PitchCalibration from '../components/PitchCalibration';
import AttackDirection from '../components/AttackDirection';
import PlayerPositioning from '../components/PlayerPositioning';
import ResultVisualization from '../components/ResultVisualization';

export const stepConfig = {
  [Step.UPLOAD]: {
    title: 'Upload Match Footage',
    component: ImageUpload,
    canProceed: (state) => state.imageSrc !== null,
    getProps: (state, dispatch) => ({
      onImageLoad: (imageSrc, imgDims) => {
        dispatch({ type: 'SET_IMAGE', payload: { imageSrc, imgDims } });
      }
    })
  },
  
  [Step.CALIBRATE]: {
    title: 'Calibrate Pitch Boundaries',
    component: PitchCalibration,
    canProceed: () => true,
    getProps: (state, dispatch) => ({
      imageSrc: state.imageSrc,
      imgDims: state.imgDims,
      calibrationPoints: state.calibrationPoints,
      onUpdatePoint: (index, point) => {
        dispatch({ type: 'UPDATE_CALIBRATION_POINT', payload: { index, point } });
      }
    })
  },
  
  [Step.DIRECTION]: {
    title: 'Set Attack Direction',
    component: AttackDirection,
    canProceed: () => true,
    getProps: (state, dispatch) => ({
      imageSrc: state.imageSrc,
      imgDims: state.imgDims,
      calibrationPoints: state.calibrationPoints,
      attackDirection: state.attackDirection,
      onDirectionChange: (direction) => {
        dispatch({ type: 'SET_ATTACK_DIRECTION', payload: direction });
      }
    })
  },
  
  [Step.DEFENDER]: {
    title: 'Mark Defender Position',
    component: PlayerPositioning,
    canProceed: (state) => state.defenderPos !== null,
    getProps: (state, dispatch) => ({
      imageSrc: state.imageSrc,
      imgDims: state.imgDims,
      calibrationPoints: state.calibrationPoints,
      position: state.defenderPos,
      onPositionChange: (pos) => {
        dispatch({ type: 'SET_DEFENDER_POS', payload: pos });
      },
      label: 'Defender',
      color: '#3b82f6' // Blue
    })
  },
  
  [Step.ATTACKER]: {
    title: 'Mark Attacker Position',
    component: PlayerPositioning,
    canProceed: (state) => state.attackerPos !== null,
    getProps: (state, dispatch) => ({
      imageSrc: state.imageSrc,
      imgDims: state.imgDims,
      calibrationPoints: state.calibrationPoints,
      position: state.attackerPos,
      onPositionChange: (pos) => {
        dispatch({ type: 'SET_ATTACKER_POS', payload: pos });
      },
      label: 'Attacker',
      color: '#ef4444' // Red
    })
  },
  
  [Step.RESULT]: {
    title: 'Offside Analysis',
    component: ResultVisualization,
    canProceed: () => false, // Last step
    getProps: (state) => ({
      imageSrc: state.imageSrc,
      imgDims: state.imgDims,
      calibrationPoints: state.calibrationPoints,
      defenderPos: state.defenderPos,
      attackerPos: state.attackerPos,
      attackDirection: state.attackDirection
    })
  }
};

