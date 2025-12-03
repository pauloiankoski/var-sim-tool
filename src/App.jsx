import { useState, useReducer, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import PitchCalibration from './components/PitchCalibration';
import AttackDirection from './components/AttackDirection';
import PlayerPositioning from './components/PlayerPositioning';
import ResultVisualization from './components/ResultVisualization';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Step enum
const Step = {
  UPLOAD: 1,
  CALIBRATE: 2,
  DIRECTION: 3,
  DEFENDER: 4,
  ATTACKER: 5,
  RESULT: 6
};

// Initial state
const initialState = {
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

// State reducer for complex state management
function stateReducer(state, action) {
  switch (action.type) {
    case 'SET_IMAGE':
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
    
    case 'SET_STEP':
      return { ...state, step: action.payload };
    
    case 'UPDATE_CALIBRATION_POINT':
      const newCalibrationPoints = [...state.calibrationPoints];
      newCalibrationPoints[action.payload.index] = action.payload.point;
      return {
        ...state,
        calibrationPoints: newCalibrationPoints,
        // Reset downstream data when calibration changes
        defenderPos: null,
        attackerPos: null
      };
    
    case 'SET_ATTACK_DIRECTION':
      return { ...state, attackDirection: action.payload };
    
    case 'SET_DEFENDER_POS':
      return { ...state, defenderPos: action.payload };
    
    case 'SET_ATTACKER_POS':
      return { ...state, attackerPos: action.payload };
    
    case 'SET_DRAGGED_POINT':
      return { ...state, draggedPointIndex: action.payload };
    
    case 'SET_MOUSE_POS':
      return { ...state, mousePos: action.payload };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  const canGoNext = () => {
    switch (state.step) {
      case Step.UPLOAD:
        return state.imageSrc !== null;
      case Step.CALIBRATE:
        return true; // Always can proceed from calibration
      case Step.DIRECTION:
        return true; // Always can proceed from direction
      case Step.DEFENDER:
        return state.defenderPos !== null;
      case Step.ATTACKER:
        return state.attackerPos !== null;
      case Step.RESULT:
        return false; // Last step
      default:
        return false;
    }
  };

  const canGoPrev = () => {
    return state.step > Step.UPLOAD;
  };

  const handleNext = () => {
    if (canGoNext()) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1 });
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1 });
    }
  };

  const getStepTitle = () => {
    switch (state.step) {
      case Step.UPLOAD:
        return 'Upload Match Footage';
      case Step.CALIBRATE:
        return 'Calibrate Pitch Boundaries';
      case Step.DIRECTION:
        return 'Set Attack Direction';
      case Step.DEFENDER:
        return 'Mark Defender Position';
      case Step.ATTACKER:
        return 'Mark Attacker Position';
      case Step.RESULT:
        return 'Offside Analysis';
      default:
        return '';
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case Step.UPLOAD:
        return <ImageUpload onImageLoad={(imageSrc, imgDims) => {
          dispatch({ type: 'SET_IMAGE', payload: { imageSrc, imgDims } });
        }} />;
      
      case Step.CALIBRATE:
        return <PitchCalibration
          imageSrc={state.imageSrc}
          imgDims={state.imgDims}
          calibrationPoints={state.calibrationPoints}
          onUpdatePoint={(index, point) => {
            dispatch({ type: 'UPDATE_CALIBRATION_POINT', payload: { index, point } });
          }}
        />;
      
      case Step.DIRECTION:
        return <AttackDirection
          imageSrc={state.imageSrc}
          imgDims={state.imgDims}
          calibrationPoints={state.calibrationPoints}
          attackDirection={state.attackDirection}
          onDirectionChange={(direction) => {
            dispatch({ type: 'SET_ATTACK_DIRECTION', payload: direction });
          }}
        />;
      
      case Step.DEFENDER:
        return <PlayerPositioning
          imageSrc={state.imageSrc}
          imgDims={state.imgDims}
          calibrationPoints={state.calibrationPoints}
          position={state.defenderPos}
          onPositionChange={(pos) => {
            dispatch({ type: 'SET_DEFENDER_POS', payload: pos });
          }}
          label="Defender"
          color="#3b82f6" // Blue
        />;
      
      case Step.ATTACKER:
        return <PlayerPositioning
          imageSrc={state.imageSrc}
          imgDims={state.imgDims}
          calibrationPoints={state.calibrationPoints}
          position={state.attackerPos}
          onPositionChange={(pos) => {
            dispatch({ type: 'SET_ATTACKER_POS', payload: pos });
          }}
          label="Attacker"
          color="#ef4444" // Red
        />;
      
      case Step.RESULT:
        return <ResultVisualization
          imageSrc={state.imageSrc}
          imgDims={state.imgDims}
          calibrationPoints={state.calibrationPoints}
          defenderPos={state.defenderPos}
          attackerPos={state.attackerPos}
          attackDirection={state.attackDirection}
        />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">VAR Simulation Tool</h1>
          <p className="text-slate-400">Video Assistant Referee - Offside Analysis</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    stepNum === state.step
                      ? 'bg-blue-500 text-white'
                      : stepNum < state.step
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 6 && (
                  <div
                    className={`w-8 h-1 ${
                      stepNum < state.step ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">{getStepTitle()}</h2>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between max-w-4xl mx-auto">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev()}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              canGoPrev()
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          {state.step === Step.UPLOAD && (
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-6 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              Reset
            </button>
          )}

          {state.step !== Step.RESULT && (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                canGoNext()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

