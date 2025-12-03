# Development Guide

## Project Structure

```
var-sim-tool/
├── public/              # Static assets
│   └── vite.svg        # Favicon
├── src/
│   ├── components/     # React components
│   │   ├── ImageUpload.jsx           # Step 1: Image upload with drag & drop
│   │   ├── PitchCalibration.jsx      # Step 2: 4-point calibration
│   │   ├── AttackDirection.jsx       # Step 3: Direction selector
│   │   ├── PlayerPositioning.jsx     # Steps 4 & 5: Player markers with magnifier
│   │   └── ResultVisualization.jsx   # Step 6: Offside analysis and export
│   ├── utils/
│   │   └── math.js     # Homography transformation utilities
│   ├── App.jsx         # Main app with state management
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind CSS imports
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Key Components

### App.jsx
- Main application component
- Uses `useReducer` for complex state management
- Implements cascading state resets
- Handles step navigation and validation

### Math Utilities (utils/math.js)
- `solveLinearSystem()`: Gaussian elimination solver
- `calculateHomography()`: Computes 3×3 homography matrix from 4 point correspondences
- `matrixInvert()`: Inverts a 3×3 matrix
- `transformPoint()`: Applies homography transformation to a point
- `screenToWorld()`: Converts screen coordinates to world coordinates
- `worldToScreen()`: Converts world coordinates to screen coordinates
- `isOffside()`: Determines if attacker is offside based on positions and direction

### Component Features

#### ImageUpload
- Drag & drop support
- File input fallback
- Image validation
- Automatic dimension detection

#### PitchCalibration
- 4 draggable corner handles (TL, TR, BR, BL)
- Visual feedback with gold/yellow overlay
- Responsive canvas scaling
- Coordinate clamping to image bounds

#### AttackDirection
- Toggle between left/right attack direction
- Visual preview with faded calibration overlay
- Clear button states

#### PlayerPositioning
- Crosshair cursor
- Click to place marker
- Keyboard arrow keys for precision adjustment (±1px)
- 3x magnifying glass loupe on hover
- Real-time coordinate display

#### ResultVisualization
- Homography calculation and error handling
- Projected offside lines (blue for defender, red for attacker)
- Clear offside/onside verdict
- World coordinate display
- PNG export functionality

## State Management

The app uses a reducer pattern with the following state structure:

```javascript
{
  step: Step,                    // Current step (1-6)
  imageSrc: HTMLImageElement,    // Loaded image
  imgDims: { w, h },            // Image dimensions
  calibrationPoints: Point[],    // 4 corner points [TL, TR, BR, BL]
  attackDirection: 'left'|'right',
  defenderPos: Point,            // Defender screen coordinates
  attackerPos: Point,            // Attacker screen coordinates
  draggedPointIndex: number,     // Currently dragged point
  mousePos: Point                // Mouse position for magnifier
}
```

### Cascading Resets

When calibration points change, downstream data (defender/attacker positions) is automatically reset to maintain consistency.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Canvas Rendering

All visualization uses HTML5 Canvas API for performance:
- Image rendering with scaling
- Overlay drawing (calibration lines, markers, offside lines)
- Coordinate transformations
- Export to PNG

## Keyboard Controls

When a player position is set:
- `ArrowUp`: Move marker up 1px
- `ArrowDown`: Move marker down 1px
- `ArrowLeft`: Move marker left 1px
- `ArrowRight`: Move marker right 1px

The app prevents default browser scrolling when arrow keys are pressed.

## Error Handling

The math utilities include error handling for:
- Singular matrices (determinant ≈ 0)
- Invalid calibration (collapsed points, bow-tie shapes)
- Out-of-bounds coordinates

Errors are caught and displayed to the user with helpful messages.

## Browser Compatibility

Requires modern browser with support for:
- ES6+ JavaScript
- HTML5 Canvas API
- FileReader API
- CSS Grid & Flexbox
- Tailwind CSS features

## Performance Considerations

- Canvas rendering is optimized with `useEffect` dependencies
- Image scaling maintains aspect ratio
- Coordinate transformations are cached where possible
- Event handlers use proper cleanup

## Future Enhancements

Potential improvements:
- Multi-player offside analysis
- Video frame-by-frame analysis
- 3D visualization mode
- Touch device support
- Undo/redo functionality
- Save/load session data

