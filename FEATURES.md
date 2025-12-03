# VAR Simulation Tool - Feature Overview

## Latest Updates (Dec 3, 2024)

### 🎯 Enhanced Canvas Sizing

**Previous**: Canvas limited to 60% of viewport height (max 600px)  
**Now**: Canvas scales to **75% of viewport** width or height

**Benefits**:
- Larger working area for better precision
- More visible details in match footage
- Better use of screen real estate
- Maintains aspect ratio

### 🎨 Perspective-Aware 3-Axis Markers

**Previous**: Simple crosshair with fixed lines  
**Now**: Intelligent 3-axis system that follows pitch geometry

#### The Three Axes

```
        Y (Vertical)
        |
        |
X ------●------ X (Horizontal)
        |
        |
        Z (Depth)
```

1. **X-Axis (Horizontal - Width)**
   - Color: Matches player color (Blue/Red)
   - Behavior: Runs parallel to pitch width
   - Purpose: Shows left-right position across the pitch
   - Implementation: Interpolates between left and right pitch edges at current depth

2. **Y-Axis (Vertical - Height)**
   - Color: Matches player color (Blue/Red)
   - Behavior: Straight vertical line (±100px from center)
   - Purpose: Shows vertical position in image space
   - Implementation: Simple vertical line for reference

3. **Z-Axis (Depth - Toward Goal)**
   - Color: Matches player color (Blue/Red)
   - Behavior: Follows pitch perspective
   - Purpose: Shows depth position on the pitch
   - Implementation: Interpolates between top and bottom pitch edges

#### Why This Matters

**Problem**: With a simple crosshair, it's hard to tell if you're marking the correct position when the pitch is at an angle.

**Solution**: The 3-axis system adapts to the pitch perspective, showing exactly where the player is in 3D space:
- The X-axis shows you're aligned with the pitch width
- The Y-axis helps with vertical positioning
- The Z-axis shows depth along the pitch

**Example Use Case**:
When marking a player's foot position for offside:
1. The Z-axis shows the depth line toward the goal
2. The X-axis shows the width position across the pitch
3. The intersection shows the exact foot position
4. All lines follow the calibrated pitch geometry

## Core Features

### 1. Image Upload
- Drag & drop interface
- Supports JPG, PNG, GIF, WebP
- Automatic dimension detection
- Instant preview

### 2. Pitch Calibration
- 4-point calibration system
- Draggable corner handles (TL, TR, BR, BL)
- Visual feedback with gold overlay
- Real-time quadrilateral rendering
- Cascading state reset (changing calibration clears player positions)

### 3. Attack Direction
- Simple left/right toggle
- Visual button states
- Faded pitch overlay for context
- Determines offside logic direction

### 4. Player Positioning (Defender & Attacker)
- **3-Axis Perspective Markers** (NEW!)
- Click to place initial position
- Drag to adjust
- Keyboard arrow keys for ±1px precision
- 3x magnifying glass loupe on hover
- Real-time coordinate display
- Color-coded: Blue (Defender), Red (Attacker)

### 5. Offside Analysis
- Homography-based coordinate transformation
- World space calculation (normalized 0-1)
- Clear offside/onside verdict
- Projected vertical lines showing player positions
- World coordinate display
- **Perspective axes on final visualization** (NEW!)

### 6. Export
- PNG download
- Full resolution output
- Includes all annotations and lines
- Timestamp in filename

## Technical Implementation

### Canvas Utilities (`src/utils/canvas.js`)

#### `calculateCanvasScale(imgWidth, imgHeight)`
```javascript
// Returns optimal scale to fit 75% of viewport
const scale = calculateCanvasScale(image.width, image.height);
```

#### `drawPerspectiveAxes(ctx, point, calibrationPoints, scale, color)`
```javascript
// Draws 3-axis markers that follow pitch geometry
drawPerspectiveAxes(ctx, playerPos, calibPoints, scale, '#3b82f6');
```

#### `interpolateEdge(p1, p2, coord, isHorizontal)`
```javascript
// Helper for calculating perspective line intersections
const point = interpolateEdge(topLeft, topRight, currentX, true);
```

### Math Utilities (`src/utils/math.js`)

- **Gaussian Elimination**: Solves linear systems for homography
- **Homography Calculation**: 3×3 matrix from 4 point correspondences
- **Matrix Inversion**: For world-to-screen transformations
- **Point Transformation**: Applies homography to coordinates
- **Offside Detection**: Compares world X coordinates based on direction

### State Management (`src/store/appReducer.js`)

- Centralized state with useReducer
- Action types enum for type safety
- Cascading state resets
- Step-based workflow

### Configuration (`src/config/stepConfig.js`)

- Declarative step definitions
- Component mapping
- Validation logic
- Props generation

## User Experience

### Workflow
1. **Upload** → Drag & drop match image
2. **Calibrate** → Drag 4 corners to match pitch
3. **Direction** → Choose attack direction (left/right)
4. **Defender** → Mark defender position with 3-axis guide
5. **Attacker** → Mark attacker position with 3-axis guide
6. **Result** → View offside decision and export

### Keyboard Controls
- `↑` Arrow Up: Move marker up 1px
- `↓` Arrow Down: Move marker down 1px
- `←` Arrow Left: Move marker left 1px
- `→` Arrow Right: Move marker right 1px

### Visual Feedback
- Progress indicator (6 steps)
- Step titles
- Disabled states for invalid actions
- Color-coded elements
- Real-time coordinate display
- Magnifying glass for precision

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support
- HTML5 Canvas API
- FileReader API
- CSS Grid & Flexbox

## Performance

- Efficient canvas rendering
- Optimized with React hooks
- Minimal re-renders
- Smooth interactions
- No external dependencies for math

## Future Enhancements

Potential improvements:
- Multi-player analysis (multiple attackers/defenders)
- Video frame-by-frame analysis
- Touch device optimization
- Undo/redo functionality
- Session save/load
- Automated pitch detection
- Player tracking
- VAR decision history
- Team management
- Match database

## Credits

Built with:
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Custom homography implementation

