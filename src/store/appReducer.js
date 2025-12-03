/**
 * Application state reducer
 * Manages the complex state for the VAR simulation tool
 */

// Step enum
export const Step = {
  UPLOAD: 1,
  CALIBRATE: 2,
  DIRECTION: 3,
  DEFENDER: 4,
  ATTACKER: 5,
  RESULT: 6
};

// Initial state
export const initialState = {
  step: Step.UPLOAD,
  imageSrc: null,
  imgDims: { w: 0, h: 0 },
  calibrationPoints: [
    { x: 100, y: 100 },  // Top-left
    { x: 700, y: 100 },  // Top-right
    { x: 700, y: 500 },  // Bottom-right
    { x: 100, y: 500 }   // Bottom-left
  ],
  attackDirection: 'right',
  defenderPos: null,
  attackerPos: null,
  draggedPointIndex: null,
  mousePos: { x: 0, y: 0 }
};

// Action types
export const ActionTypes = {
  SET_IMAGE: 'SET_IMAGE',
  SET_STEP: 'SET_STEP',
  UPDATE_CALIBRATION_POINT: 'UPDATE_CALIBRATION_POINT',
  SET_ATTACK_DIRECTION: 'SET_ATTACK_DIRECTION',
  SET_DEFENDER_POS: 'SET_DEFENDER_POS',
  SET_ATTACKER_POS: 'SET_ATTACKER_POS',
  SET_DRAGGED_POINT: 'SET_DRAGGED_POINT',
  SET_MOUSE_POS: 'SET_MOUSE_POS',
  RESET: 'RESET'
};

// State reducer
export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_IMAGE:
      return {
        ...initialState,
        step: Step.CALIBRATE,
        imageSrc: action.payload.imageSrc,
        imgDims: action.payload.imgDims,
        calibrationPoints: [
          { x: action.payload.imgDims.w * 0.1, y: action.payload.imgDims.h * 0.1 },
          { x: action.payload.imgDims.w * 0.9, y: action.payload.imgDims.h * 0.1 },
          { x: action.payload.imgDims.w * 0.9, y: action.payload.imgDims.h * 0.9 },
          { x: action.payload.imgDims.w * 0.1, y: action.payload.imgDims.h * 0.9 }
        ]
      };
    
    case ActionTypes.SET_STEP:
      return { ...state, step: action.payload };
    
    case ActionTypes.UPDATE_CALIBRATION_POINT:
      const newCalibrationPoints = [...state.calibrationPoints];
      newCalibrationPoints[action.payload.index] = action.payload.point;
      return {
        ...state,
        calibrationPoints: newCalibrationPoints,
        // Reset downstream data when calibration changes
        defenderPos: null,
        attackerPos: null
      };
    
    case ActionTypes.SET_ATTACK_DIRECTION:
      return { ...state, attackDirection: action.payload };
    
    case ActionTypes.SET_DEFENDER_POS:
      return { ...state, defenderPos: action.payload };
    
    case ActionTypes.SET_ATTACKER_POS:
      return { ...state, attackerPos: action.payload };
    
    case ActionTypes.SET_DRAGGED_POINT:
      return { ...state, draggedPointIndex: action.payload };
    
    case ActionTypes.SET_MOUSE_POS:
      return { ...state, mousePos: action.payload };
    
    case ActionTypes.RESET:
      return initialState;
    
    default:
      return state;
  }
}

