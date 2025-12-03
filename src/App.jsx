import { useReducer } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { appReducer, initialState, Step, ActionTypes } from './store/appReducer';
import { stepConfig } from './config/stepConfig';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Get current step configuration
  const currentStepConfig = stepConfig[state.step];
  const StepComponent = currentStepConfig.component;

  const canGoNext = () => {
    return currentStepConfig.canProceed(state);
  };

  const canGoPrev = () => {
    return state.step > Step.UPLOAD;
  };

  const handleNext = () => {
    if (canGoNext()) {
      dispatch({ type: ActionTypes.SET_STEP, payload: state.step + 1 });
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      dispatch({ type: ActionTypes.SET_STEP, payload: state.step - 1 });
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
        <h2 className="text-2xl font-semibold text-center mb-6">{currentStepConfig.title}</h2>

        {/* Step Content */}
        <div className="mb-8">
          <StepComponent {...currentStepConfig.getProps(state, dispatch)} />
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

          {(state.step !== Step.UPLOAD || state.image) && (
            <button
              onClick={() => dispatch({ type: ActionTypes.RESET })}
              className="px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
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

