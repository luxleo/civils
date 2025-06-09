import React from 'react';
import { useBeamContext } from '../../../contexts';

const BeamContextExample: React.FC = () => {
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

  // Example of updating beam length
  const handleBeamLengthChange = (newLength: number) => {
    beam.changeLength(newLength);
  };

  // Example of adding a support
  const handleAddSupport = () => {
    addSupport({
      id: `support-${Date.now()}`,
      type: 'pinned',
      position: 0
    });
  };

  // Example of updating a support
  const handleUpdateSupport = (id: number, position: number) => {
    updateSupport(id, { position });
  };

  // Example of adding a point load
  const handleAddPointLoad = () => {
    addLoad({
      type: 'pointLoad',
      position: 0,
      magnitude: 10
    });
  };

  // Example of updating a point load
  const handleUpdatePointLoad = (id: number, magnitude: number) => {
    updatePointLoad(id, { magnitude });
  };

  // Example of adding a distributed load
  const handleAddDistributedLoad = () => {
    addLoad({
      type: 'distributedLoad',
      startPosition: 0,
      endPosition: beam.length,
      startMagnitude: 10,
      endMagnitude: 10
    });
  };

  // Example of updating a distributed load
  const handleUpdateDistributedLoad = (id: number, startMagnitude: number, endMagnitude: number) => {
    updateDistributedLoad(id, { startMagnitude, endMagnitude });
  };

  // Example of adding an angled load
  const handleAddAngledLoad = () => {
    addLoad({
      type: 'angledLoad',
      position: 0,
      magnitude: 10,
      angle: 45
    });
  };

  // Example of updating an angled load
  const handleUpdateAngledLoad = (id: number, angle: number) => {
    updateAngledLoad(id, { angle });
  };

  return (
    <div>
      <h2>Beam Context Example</h2>
      
      <div>
        <h3>Beam</h3>
        <p>Length: {beam.length}</p>
        <button onClick={() => handleBeamLengthChange(beam.length + 1)}>Increase Length</button>
      </div>
      
      <div>
        <h3>Supports</h3>
        <button onClick={handleAddSupport}>Add Support</button>
        <ul>
          {Array.from(supports.entries()).map(([id, support]) => (
            <li key={id}>
              Support {id}: Type {support.type}, Position {support.position}
              <button onClick={() => handleUpdateSupport(id, support.position + 1)}>
                Move Right
              </button>
              <button onClick={() => removeSupport(id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3>Loads</h3>
        <button onClick={handleAddPointLoad}>Add Point Load</button>
        <button onClick={handleAddDistributedLoad}>Add Distributed Load</button>
        <button onClick={handleAddAngledLoad}>Add Angled Load</button>
        <ul>
          {Array.from(loads.entries()).map(([id, load]) => {
            if (load.type === 'pointLoad') {
              return (
                <li key={id}>
                  Point Load {id}: Position {load.position}, Magnitude {load.magnitude}
                  <button onClick={() => handleUpdatePointLoad(id, load.magnitude + 1)}>
                    Increase Magnitude
                  </button>
                  <button onClick={() => removeLoad(id)}>Remove</button>
                </li>
              );
            } else if (load.type === 'distributedLoad') {
              return (
                <li key={id}>
                  Distributed Load {id}: From {load.startPosition} to {load.endPosition}, 
                  Magnitude {load.startMagnitude} to {load.endMagnitude}
                  <button onClick={() => handleUpdateDistributedLoad(id, load.startMagnitude + 1, load.endMagnitude + 1)}>
                    Increase Magnitude
                  </button>
                  <button onClick={() => removeLoad(id)}>Remove</button>
                </li>
              );
            } else if (load.type === 'angledLoad') {
              return (
                <li key={id}>
                  Angled Load {id}: Position {load.position}, Magnitude {load.magnitude}, Angle {load.angle}
                  <button onClick={() => handleUpdateAngledLoad(id, load.angle + 5)}>
                    Increase Angle
                  </button>
                  <button onClick={() => removeLoad(id)}>Remove</button>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </div>
    </div>
  );
};

export default BeamContextExample;