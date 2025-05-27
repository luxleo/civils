# Beam Context

This directory contains the React context and hooks for managing beam data in the application.

## Components and Hooks

### BeamProvider

The `BeamProvider` component provides the beam context to its children. It manages the state of the beam, supports, and loads.

```tsx
import { BeamProvider } from '@/contexts';

const App = () => {
  return (
    <BeamProvider>
      {/* Your components here */}
    </BeamProvider>
  );
};
```

### useBeamContext

The `useBeamContext` hook provides access to the beam context. It must be used within a `BeamProvider`.

```tsx
import { useBeamContext } from '@/contexts';

const MyComponent = () => {
  const {
    beam,
    supports,
    loads,
    addSupport,
    addLoad,
    removeSupport,
    removeLoad,
    updateSupport,
    updatePointLoad,
    updateDistributedLoad,
    updateAngledLoad
  } = useBeamContext();

  // Use the context here
};
```

## Context Types

### BeamContext

```tsx
type BeamContext = {
  length: number;
  changeLength: (length: number) => void;
}
```

### SupportContext

```tsx
type SupportContext = {
  id: string;
  type: SupportsType; // 'fixed' | 'roller' | 'pinned'
  position: number;
}
```

### LoadContext

LoadContext is a union type of the following load types:

#### PointLoadContext

```tsx
type PointLoadContext = {
  type: 'pointLoad';
  position: number;
  magnitude: number;
}
```

#### DistributedLoadContext

```tsx
type DistributedLoadContext = {
  type: 'distributedLoad';
  startMagnitude: number;
  endMagnitude: number;
  startPosition: number;
  endPosition: number;
}
```

#### AngledLoadContext

```tsx
type AngledLoadContext = {
  type: 'angledLoad';
  magnitude: number;
  position: number;
  angle: number;
}
```

## Context Methods

### Beam Methods

- `beam.changeLength(length: number)`: Updates the length of the beam

### Support Methods

- `addSupport(support: SupportContext)`: Adds a new support
- `removeSupport(id: number)`: Removes a support by ID
- `updateSupport(id: number, support: Partial<SupportContext>)`: Updates a support by ID

### Load Methods

- `addLoad(load: LoadContext)`: Adds a new load
- `removeLoad(id: number)`: Removes a load by ID
- `updatePointLoad(id: number, load: Partial<PointLoadContext>)`: Updates a point load by ID
- `updateDistributedLoad(id: number, load: Partial<DistributedLoadContext>)`: Updates a distributed load by ID
- `updateAngledLoad(id: number, load: Partial<AngledLoadContext>)`: Updates an angled load by ID

## Example Usage

See the `BeamContextExample.tsx` component in the `components/BeamPage/examples` directory for a complete example of how to use the beam context.