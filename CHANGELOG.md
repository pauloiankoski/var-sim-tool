# Changelog

All notable changes to the VAR Simulation Tool project.

## [Unreleased]

### Added - 2024-12-03 (Latest)

#### Pitch Calibration Enhancements
- **Magnifying Glass Loupe**: 3x zoom magnifier appears when hovering over calibration canvas
- **Crosshair Cursor**: Visual crosshair for precise corner placement
- **Magnifier Features**:
  - Shows calibration handles when they're in the magnified view
  - Gold/yellow themed to match calibration colors
  - Displays current corner being dragged with coordinates
  - Real-time feedback during corner adjustment

### Added - 2024-12-03 (Earlier)

#### Canvas Sizing Improvements
- **75% Viewport Sizing**: Canvas now automatically scales to fit 75% of the viewport width or height (whichever is smaller)
- **Better Visibility**: Larger canvas size provides better detail visibility for precise positioning
- **Responsive Scaling**: Maintains aspect ratio while maximizing screen usage

#### Perspective-Aware 3-Axis Markers
- **Replaced Simple Crosshair**: Old crosshair replaced with intelligent 3-axis perspective lines
- **X-Axis (Horizontal)**: Line parallel to pitch width, following the perspective at the current Y position
- **Y-Axis (Vertical)**: Straight vertical line in image space (up/down)
- **Z-Axis (Depth)**: Line following pitch depth perspective, showing the direction toward the goal
- **Accurate Positioning**: Axes follow the calibrated pitch geometry for precise player marking

#### New Utilities
- `calculateCanvasScale()`: Centralized function for consistent canvas sizing across all components
- `drawPerspectiveAxes()`: Renders 3-axis lines that adapt to pitch perspective
- `interpolateEdge()`: Helper function for calculating perspective line intersections

### Fixed - 2024-12-03

#### Perspective Calculation Improvements
- **Bilinear Interpolation**: Implemented proper bilinear interpolation for perspective axes
- **Newton-Raphson Method**: Added iterative solver to find parametric position within quadrilateral
- **Accurate Axis Lines**: X and Z axes now correctly follow pitch geometry based on calibration
- **Proper World Mapping**: Axes adapt to pitch perspective at any angle

### Changed

#### Component Updates
- **PitchCalibration**: Updated to use 75% viewport sizing, added magnifier loupe and crosshair
- **AttackDirection**: Updated to use 75% viewport sizing
- **PlayerPositioning**: Now displays 3-axis perspective markers instead of crosshair
- **ResultVisualization**: Shows perspective axes on final analysis for clarity

#### Code Organization
- Canvas utilities extracted to `src/utils/canvas.js`
- Consistent scaling logic across all visualization components

### Technical Details

#### 3-Axis Marker System

The new marker system provides three distinct axes:

1. **X-Axis (Width)**: 
   - Runs horizontally across the pitch
   - Parallel to the pitch width at any given depth
   - Interpolates between left and right pitch edges

2. **Y-Axis (Height)**:
   - Vertical line in image space
   - Represents player height/vertical position
   - Extends 100px up and down from marker point

3. **Z-Axis (Depth)**:
   - Follows pitch perspective toward the goal
   - Interpolates between top and bottom pitch edges
   - Shows the depth position on the pitch

#### Visual Representation

```
        Y (Vertical - up/down)
        |
        |
X ------+------ X (Horizontal - left/right, parallel to pitch)
        |
        |
        Z (Depth - following pitch perspective)
```

The axes dynamically adjust based on:
- Current marker position
- Calibrated pitch boundaries
- Pitch perspective/angle

#### Benefits

1. **Improved Accuracy**: Users can see exactly where they're marking in 3D space
2. **Better Depth Perception**: Z-axis shows pitch depth clearly
3. **Intuitive Positioning**: Axes follow natural pitch geometry
4. **Professional Look**: More sophisticated than simple crosshair

### Performance

- No performance impact
- Efficient canvas rendering
- Smooth real-time updates

## [1.0.0] - 2024-12-03

### Initial Release

- Complete VAR simulation tool implementation
- Image upload with drag & drop
- 4-point pitch calibration
- Attack direction selector
- Player positioning with magnifier
- Offside calculation and visualization
- PNG export functionality
- Homography-based coordinate transformation
- Keyboard controls for precision
- Responsive design with Tailwind CSS

## Refactoring History

### 2024-12-03 - Code Organization
- Extracted state reducer to `src/store/appReducer.js`
- Created step configuration in `src/config/stepConfig.js`
- Reduced App.jsx from 308 lines to 124 lines (60% reduction)
- Improved maintainability and testability
- Added ActionTypes enum for type safety

