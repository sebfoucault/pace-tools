# Running Calculator

A mobile-friendly Web App for running calculations and conversions. Calculate pace, distance, and time based on two known values, and convert between speed and pace with support for both metric and imperial units.

## Features

- **Running Calculator**: Calculate any running metric when you have two of the three values:
  - Distance and Time → Pace
  - Distance and Pace → Time
  - Time and Pace → Distance

- **Speed ↔ Pace Converter**: Real-time conversion between speed and pace
  - Metric units (km/h ↔ min/km)
  - Imperial units (mph ↔ min/mile)

- **Multilingual Support**: Available in English, Spanish, French, and German
- **Unit System Support**: Switch between metric and imperial units
- **Mobile-Friendly**: Responsive design optimized for mobile devices

## Installation and Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd running-calculator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder, ready for deployment.

### Running Tests

```bash
npm test
```

Run tests in interactive watch mode:
```bash
npm test -- --watch
```

### Testing Conventions

- Structure: Keep tests inside `__tests__` folders next to their domain:
   - `src/components/__tests__`, `src/hooks/__tests__`, `src/utils/__tests__`.
- Component parity: Ensure each component under `src/components` has at least one corresponding test file.
- Naming: Use `ComponentName.test.tsx` for broad coverage and `ComponentName.Feature.test.tsx` for focused scenarios (e.g., `RunningCalculator.Recalculation.test.tsx`).
- No smoke tests: Avoid generic render-only tests (e.g., `App.test.tsx`). Prefer meaningful behavioral tests within component-scoped suites.
- i18n in tests: Component tests mock `react-i18next` to keep labels deterministic:
   ```ts
   jest.mock('react-i18next', () => ({
      useTranslation: () => ({ t: (key: string) => key }),
   }));
   ```
- Coverage run (CI-friendly):
   ```bash
   CI=true npm test -- --coverage --watchAll=false
   ```

## Usage

Refer to the in-app help dialog for detailed instructions on using the calculator and converter features.

