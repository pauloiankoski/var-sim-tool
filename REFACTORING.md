# Refactoring Summary

## Overview

The `App.jsx` component has been refactored to improve code organization, maintainability, and reduce repetition. The main file was reduced from **308 lines to 124 lines** (a 60% reduction).

## Changes Made

### 1. Extracted State Reducer (`src/store/appReducer.js`)

**Before:** The reducer was defined inline within `App.jsx`

**After:** Moved to a dedicated file with:
- `Step` enum export
- `initialState` export
- `ActionTypes` enum for type safety
- `appReducer` function

**Benefits:**
- Easier to test in isolation
- Can be reused if needed
- Clearer separation of concerns
- Type-safe action types

### 2. Created Step Configuration (`src/config/stepConfig.js`)

**Before:** Three large switch-case statements:
- `getStepTitle()` - 18 lines
- `canGoNext()` - 18 lines  
- `renderStep()` - 68 lines

**After:** Single configuration object that maps each step to:
- `title`: Step display name
- `component`: React component to render
- `canProceed`: Validation function
- `getProps`: Props factory function

**Benefits:**
- Declarative configuration
- Easy to add/modify steps
- Single source of truth
- Better testability

### 3. Simplified App Component

**Before:**
```javascript
// 308 lines with:
- Inline reducer definition (90 lines)
- getStepTitle() switch (18 lines)
- canGoNext() switch (18 lines)
- renderStep() switch (68 lines)
```

**After:**
```javascript
// 124 lines with:
- Clean imports
- Configuration-driven rendering
- Minimal logic
```

## Code Comparison

### Before: Repetitive Switch Statements

```javascript
const getStepTitle = () => {
  switch (state.step) {
    case Step.UPLOAD:
      return 'Upload Match Footage';
    case Step.CALIBRATE:
      return 'Calibrate Pitch Boundaries';
    // ... 4 more cases
  }
};

const canGoNext = () => {
  switch (state.step) {
    case Step.UPLOAD:
      return state.imageSrc !== null;
    case Step.CALIBRATE:
      return true;
    // ... 4 more cases
  }
};

const renderStep = () => {
  switch (state.step) {
    case Step.UPLOAD:
      return <ImageUpload onImageLoad={...} />;
    case Step.CALIBRATE:
      return <PitchCalibration ... />;
    // ... 4 more cases with lots of props
  }
};
```

### After: Configuration-Driven

```javascript
// In stepConfig.js
export const stepConfig = {
  [Step.UPLOAD]: {
    title: 'Upload Match Footage',
    component: ImageUpload,
    canProceed: (state) => state.imageSrc !== null,
    getProps: (state, dispatch) => ({ onImageLoad: ... })
  },
  // ... other steps
};

// In App.jsx
const currentStepConfig = stepConfig[state.step];
const StepComponent = currentStepConfig.component;

// Render
<h2>{currentStepConfig.title}</h2>
<StepComponent {...currentStepConfig.getProps(state, dispatch)} />
```

## File Structure

```
src/
├── App.jsx                    # Main component (124 lines)
├── store/
│   └── appReducer.js         # State management (105 lines)
├── config/
│   └── stepConfig.js         # Step configuration (111 lines)
├── components/
│   ├── ImageUpload.jsx
│   ├── PitchCalibration.jsx
│   ├── AttackDirection.jsx
│   ├── PlayerPositioning.jsx
│   └── ResultVisualization.jsx
└── utils/
    └── math.js
```

## Benefits of This Refactoring

### 1. **Maintainability**
- Adding a new step only requires updating `stepConfig.js`
- No need to modify multiple switch statements
- Clear separation of concerns

### 2. **Testability**
- Reducer can be tested independently
- Step configuration can be validated
- Props generation can be tested in isolation

### 3. **Readability**
- App.jsx is now focused on rendering and navigation
- Configuration is declarative and self-documenting
- Less cognitive load when reading the code

### 4. **Type Safety**
- `ActionTypes` enum prevents typos in action types
- `Step` enum is centralized and exported
- Configuration structure is consistent

### 5. **Extensibility**
- Easy to add new steps
- Easy to add step-specific metadata (e.g., icons, descriptions)
- Configuration could be loaded dynamically if needed

## Migration Guide

If you need to add a new step:

1. **Add to Step enum** (`src/store/appReducer.js`):
```javascript
export const Step = {
  // ... existing steps
  NEW_STEP: 7
};
```

2. **Add reducer case if needed** (`src/store/appReducer.js`):
```javascript
case ActionTypes.SET_NEW_DATA:
  return { ...state, newData: action.payload };
```

3. **Add to stepConfig** (`src/config/stepConfig.js`):
```javascript
[Step.NEW_STEP]: {
  title: 'New Step Title',
  component: NewStepComponent,
  canProceed: (state) => state.newData !== null,
  getProps: (state, dispatch) => ({
    data: state.newData,
    onChange: (data) => dispatch({ 
      type: ActionTypes.SET_NEW_DATA, 
      payload: data 
    })
  })
}
```

That's it! No need to modify `App.jsx` at all.

## Performance Considerations

- No performance impact - same number of renders
- Slightly more memory for configuration object (negligible)
- Function calls are optimized by JavaScript engines
- Props spreading is standard React pattern

## Testing Recommendations

With this refactoring, you can now easily test:

1. **Reducer Logic**:
```javascript
import { appReducer, initialState, ActionTypes } from './store/appReducer';

test('SET_IMAGE resets state and moves to calibration', () => {
  const action = {
    type: ActionTypes.SET_IMAGE,
    payload: { imageSrc: mockImage, imgDims: { w: 800, h: 600 } }
  };
  const newState = appReducer(initialState, action);
  expect(newState.step).toBe(Step.CALIBRATE);
});
```

2. **Step Configuration**:
```javascript
import { stepConfig } from './config/stepConfig';

test('all steps have required properties', () => {
  Object.values(stepConfig).forEach(config => {
    expect(config).toHaveProperty('title');
    expect(config).toHaveProperty('component');
    expect(config).toHaveProperty('canProceed');
    expect(config).toHaveProperty('getProps');
  });
});
```

## Conclusion

This refactoring significantly improves the codebase quality without changing any functionality. The code is now more maintainable, testable, and easier to extend. The configuration-driven approach eliminates repetitive switch statements and provides a clear structure for managing application steps.

