# VAR Simulation Tool

A client-side React application simulating Video Assistant Referee (VAR) technology. This tool allows users to upload match footage, calibrate the pitch perspective using a 4-point homography transform, and accurately project 2D screen coordinates into 3D world space to determine offside positions.

## Features

- **Image Upload**: Drag & drop match footage
- **Pitch Calibration**: 4-point perspective calibration with draggable handles
- **Attack Direction**: Configure which direction the attacking team is playing
- **Player Positioning**: Precise placement of defender and attacker positions with 3-axis perspective markers
- **Precision Controls**: Keyboard arrow keys for pixel-perfect adjustments
- **Visual Aids**: Magnifying glass loupe during point placement
- **Perspective-Aware Markers**: 3-axis lines (X, Y, Z) that follow pitch geometry for accurate positioning
- **Large Canvas**: 75% viewport sizing for better visibility and precision
- **Offside Analysis**: Real-time calculation and visualization of offside lines
- **Export**: Download the final analysis image

## Technical Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Rendering**: HTML5 Canvas API
- **Mathematics**: Custom homography transformation implementation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

**Setup Steps:**

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The site will automatically deploy on every push to `main` branch

**Manual Deployment:**

You can also trigger deployment manually from the Actions tab in your GitHub repository.

**Live Site:**

Once deployed, your site will be available at:
```
https://yourusername.github.io/var-sim-tool/
```

## How It Works

The tool uses planar homography to map a distorted quadrilateral (screen space) to a perfect square unit (world space 0,0 to 1,1). This allows accurate projection of 2D screen coordinates into 3D world space without a full 3D engine.

### Workflow

1. **Upload Match Footage**: Drag and drop or click to select an image of the match
2. **Calibrate the Pitch**: Drag the 4 corner handles (TL, TR, BR, BL) to match the pitch boundaries
3. **Set Attack Direction**: Choose whether the attacking team is playing left or right
4. **Mark Defender Position**: Click to place the defender's position (blue marker)
5. **Mark Attacker Position**: Click to place the attacker's position (red marker)
6. **View Analysis**: See the offside decision with projected lines and world coordinates
7. **Export**: Download the final analysis image

### Features in Detail

#### Cascading State Resets
Changing upstream configuration (e.g., calibration points) automatically invalidates downstream data (e.g., player positions), ensuring data consistency.

#### Precision Controls
- **Mouse**: Click and drag for quick placement
- **Keyboard**: Use arrow keys (↑ ↓ ← →) for pixel-perfect adjustments after placing a marker

#### Visual Aids
- **Magnifying Glass**: A 3x zoom loupe appears when hovering over the canvas during player positioning
- **3-Axis Perspective Markers**: Intelligent markers that follow pitch geometry
  - **X-Axis**: Horizontal line parallel to pitch width
  - **Y-Axis**: Vertical line for height positioning
  - **Z-Axis**: Depth line following pitch perspective toward the goal
- **Large Canvas**: 75% of viewport for maximum visibility
- **Color-Coded Lines**: Blue for defender, red for attacker
- **Real-time Feedback**: See the offside decision immediately with world coordinates

### Mathematical Background

The homography transformation is calculated using a system of linear equations derived from the 4 calibration points. The 3×3 homography matrix H maps screen coordinates to normalized world coordinates (0,0 to 1,1).

**Offside Logic**:
- If attacking **right**: Offside when `attackerX > defenderX`
- If attacking **left**: Offside when `attackerX < defenderX`

## License

MIT

