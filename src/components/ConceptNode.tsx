import type {NodeProps} from '@xyflow/react';

interface ConceptNodeData {
  label: string;
  concepts: string[];
  color: string;
}

export default function ConceptNode({data}: NodeProps) {
  const {label, concepts, color} = data as ConceptNodeData;

  return (
    <div
      className="concept-node"
      style={{borderColor: color}}
    >
      <div className="concept-node-header" style={{background: color}}>
        {label}
      </div>
      <div className="concept-node-body">
        {concepts.map((concept) => (
          <span key={concept} className="concept-tag">
            {concept}
          </span>
        ))}
      </div>
    </div>
  );
}
