VAR Simulation Tool - Project Plan (v2)
1. Executive Summary
A client-side React application simulating Video Assistant Referee (VAR) technology. The tool allows users to upload match footage, calibrate the pitch perspective using a 4-point homography transform, and accurately project 2D screen coordinates into 3D world space to determine offside positions.
Key enhancements in v2:
 * Cascading State Resets: Changing upstream configuration (e.g., calibration) invalidates downstream data (e.g., player positions).
 * Precision Controls: Keyboard arrow keys for pixel-perfect adjustments.
 * Visual Aids: Magnifying glass loupe during point placement.
2. Technical Architecture
Core Stack
 * Framework: React (Functional Components + Hooks).
 * State Management: useState / useReducer (for complex step logic).
 * Rendering: HTML5 Canvas API (performance & low-level pixel manipulation).
 * Styling: Tailwind CSS.
 * Icons: Lucide-React.
Data Structures
// Enums
enum Step {
  UPLOAD = 1,
  CALIBRATE = 2,
  DIRECTION = 3,
  DEFENDER = 4,
  ATTACKER = 5,
  RESULT = 6
}

// State Schema
interface AppState {
  step: Step;
  imageSrc: HTMLImageElement | null;
  imgDims: { w: number, h: number };
  
  // Calibration
  calibrationPoints: Point[]; // [TL, TR, BR, BL] - 4 points
  
  // Gameplay Data
  attackDirection: 'left' | 'right';
  defenderPos: Point | null; // Screen coordinates
  attackerPos: Point | null; // Screen coordinates
  
  // Interaction
  draggedPointIndex: number | string | null; // Index 0-3 or 'def'/'att'
  mousePos: Point; // For magnifier loupe
}

3. Mathematical Engine (The Homography)
To simulate the 3D world without a 3D engine, we use Planar Homography.
 * Concept: Map a distorted quadrilateral (screen space) to a perfect square unit (world space 0,0 to 1,1).
 * Matrix calculation:
   * Solve a system of linear equations (Ax = b) derived from the 4 calibration points to find the 3\times3 Homography Matrix (H).
   * You will need a helper function to solve linear systems (Gaussian elimination).
 * Coordinate Transforms:
   * Screen \to World (P_{world} = H \times P_{screen}): Used to determine the relative "X" position of players on the normalized pitch.
   * World \to Screen (P_{screen} = H^{-1} \times P_{world}): Used to draw the vertical offside lines back onto the skewed image.
4. Feature Specification & User Flow
Step 1: Image Upload
 * UI: Drag & Drop area.
 * Action: Read file as DataURL, load into HTMLImageElement, set canvas dimensions.
 * Reset Logic: uploading a new image hard-resets all state variables.
Step 2: Pitch Calibration
 * UI: Overlay a semi-transparent quadrilateral on the canvas.
 * Interaction: 4 draggable handles.
 * UX: Use standard colors (Yellow/Gold) for calibration lines.
 * Reset Logic: If user returns to this step and moves a point, defenderPos and attackerPos must be set to null.
Step 3: Attack Direction
 * UI: Toggle (Left vs Right).
 * Logic: Determines the inequality check:
   * Right: Attacker.WorldX > Defender.WorldX ? Offside.
   * Left:  Attacker.WorldX < Defender.WorldX ? Offside.
Step 4 & 5: Player Positioning
 * UI: Crosshair cursor.
 * Interaction (Mouse): Click and drag to place point.
 * Interaction (Keyboard): * Listen for ArrowUp, ArrowDown, ArrowLeft, ArrowRight.
   * Modify selected coordinates by +/- 1px.
   * e.preventDefault() to stop window scrolling.
 * Visual Aid: Magnifier Loupe.
   * Render a small absolute div near the cursor.
   * Inside, display a scaled-up background image position (CSS background-position or a secondary canvas render).
Step 6: Calculation & Result
 * Logic:
   * Compute Matrix H.
   * Transform Defender Screen Point \to World X (X_{def}).
   * Transform Attacker Screen Point \to World X (X_{att}).
   * Compare based on direction.
 * Rendering:
   * Create a virtual vertical line in World Space at X_{def}.
   * Project top (X_{def}, 0) and bottom (X_{def}, 1) of that line back to Screen Space using H^{-1}.
   * Draw the line (Blue for Defender).
   * Repeat for Attacker (Red).
 * Export: canvas.toDataURL() to download the final analysis.
5. Implementation Roadmap
 * Setup: Create React App + Tailwind.
 * Math Module: Implement solveLinearSystem, calculateHomography, and matrixInvert utils.
 * Canvas Shell: Build the responsive canvas wrapper that handles mouse coordinate normalization.
 * State Logic: Implement the changeStep function that handles the "Cascading Resets".
 * Calibration Step: Implement the 4-point drag system.
 * Player Step: Implement point placement + Magnifier Loupe.
 * Keyboard Listeners: Add the useEffect hook for arrow keys.
 * Render Engine: Connect the Math module to the Canvas useEffect to draw the projected lines.
6. Edge Case Handling
 * Singular Matrices: If the user draws a "bow tie" shape or collapses points into a line, the math will fail. Wrap math calls in try/catch.
 * Image Aspect Ratio: Ensure the canvas resizes to fit the screen while maintaining the image aspect ratio (use object-fit: contain logic or JS scaling).
