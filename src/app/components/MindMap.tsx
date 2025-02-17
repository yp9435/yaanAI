import React, { useState } from 'react';

interface Node {
  id: number;
  text: string;
  x: number;
  y: number;
}

const MindMap: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeText, setNodeText] = useState('');
  const [nextId, setNextId] = useState(1);

  const addNode = () => {
    if (!nodeText.trim()) return;

    setNodes([...nodes, { id: nextId, text: nodeText, x: 100, y: 100 }]);
    setNodeText('');
    setNextId(nextId + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mind Map</h2>
      <div className="mb-4">
        <input
          type="text"
          value={nodeText}
          onChange={(e) => setNodeText(e.target.value)}
          placeholder="Enter node text"
          className="border p-2 mr-2"
        />
        <button onClick={addNode} className="p-2 border rounded bg-blue-500 text-white">
          Add Node
        </button>
      </div>
      <div className="relative border p-4" style={{ height: '400px', overflow: 'auto' }}>
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute p-2 border rounded bg-white"
            style={{ left: node.x, top: node.y }}
          >
            {node.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MindMap; 