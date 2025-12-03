# VAR Simulation Tool

A client-side React application simulating Video Assistant Referee (VAR) technology. This tool allows users to upload match footage, calibrate the pitch perspective using a 4-point homography transform, and accurately project 2D screen coordinates into 3D world space to determine offside positions.

## Features

- **Image Upload**: Drag & drop match footage
- **Pitch Calibration**: 4-point perspective calibration with draggable handles
- **Attack Direction**: Configure which direction the attacking team is playing
- **Player Positioning**: Precise placement of defender and attacker positions
- **Precision Controls**: Keyboard arrow keys for pixel-perfect adjustments
- **Visual Aids**: Magnifying glass loupe during point placement
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

## How It Works

The tool uses planar homography to map a distorted quadrilateral (screen space) to a perfect square unit (world space 0,0 to 1,1). This allows accurate projection of 2D screen coordinates into 3D world space without a full 3D engine.

### Workflow

1. Upload match footage
2. Calibrate the pitch by placing 4 corner points
3. Set the attack direction
4. Mark the defender position
5. Mark the attacker position
6. View the offside analysis with projected lines
7. Export the final image

## License

MIT

