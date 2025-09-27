import React, { useState, useEffect } from 'react';
import PairwiseComparisonMatrix from './PairwiseComparisonMatrix';
import AHPResultsVisualization from './AHPResultsVisualization';
import { calculateHierarchicalAHP } from '../../utils/ahpCalculator';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight?: number;
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
}

interface AHPProject {
  id: string;
  name: string;
  description: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  goal: string;
  status: 'setup' | 'criteria-comparison' | 'alternatives-comparison' | 'completed';
}

interface AHPProjectManagerProps {
  projectId?: string;
  onSave?: (project: AHPProject) => void;
}

const AHPProjectManager: React.FC<AHPProjectManagerProps> = ({ projectId, onSave }) => {
  const [project, setProject] = useState<AHPProject>({
    id: projectId || `project-${Date.now()}`,
    name: '',
    description: '',
    goal: '',
    criteria: [],
    alternatives: [],
    status: 'setup'
  });

  const [criteriaWeights, setCriteriaWeights] = useState<{ [key: string]: number }>({});
  const [alternativeScores, setAlternativeScores] = useState<{ 
    [criterionId: string]: { [alternativeId: string]: number } 
  }>({});
  const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);
  const [finalResults, setFinalResults] = useState<any>(null);

  // Step 1: Project Setup
  const [newCriterion, setNewCriterion] = useState('');
  const [newAlternative, setNewAlternative] = useState('');

  const addCriterion = () => {
    if (newCriterion.trim()) {
      const criterion: Criterion = {
        id: `criterion-${Date.now()}`,
        name: newCriterion.trim(),
      };
      setProject(prev => ({
        ...prev,
        criteria: [...prev.criteria, criterion]
      }));
      setNewCriterion('');
    }
  };

  const removeCriterion = (id: string) => {
    setProject(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id)
    }));
  };

  const addAlternative = () => {
    if (newAlternative.trim()) {
      const alternative: Alternative = {
        id: `alternative-${Date.now()}`,
        name: newAlternative.trim(),
      };
      setProject(prev => ({
        ...prev,
        alternatives: [...prev.alternatives, alternative]
      }));
      setNewAlternative('');
    }
  };

  const removeAlternative = (id: string) => {
    setProject(prev => ({
      ...prev,
      alternatives: prev.alternatives.filter(a => a.id !== id)
    }));
  };

  const startComparison = () => {
    if (project.criteria.length >= 2 && project.alternatives.length >= 2) {
      setProject(prev => ({ ...prev, status: 'criteria-comparison' }));
    }
  };

  const handleCriteriaComparison = (results: any) => {
    const weights: { [key: string]: number } = {};
    project.criteria.forEach((criterion, index) => {
      weights[criterion.id] = results.results.priorities[index];
    });
    setCriteriaWeights(weights);
    setProject(prev => ({ ...prev, status: 'alternatives-comparison' }));
    setCurrentCriterionIndex(0);
  };

  const handleAlternativesComparison = (criterionId: string, results: any) => {
    const scores: { [alternativeId: string]: number } = {};
    project.alternatives.forEach((alternative, index) => {
      scores[alternative.id] = results.results.priorities[index];
    });
    
    setAlternativeScores(prev => ({
      ...prev,
      [criterionId]: scores
    }));

    // Move to next criterion or complete
    if (currentCriterionIndex < project.criteria.length - 1) {
      setCurrentCriterionIndex(prev => prev + 1);
    } else {
      // All comparisons done, calculate final results
      calculateFinalResults();
    }
  };

  const calculateFinalResults = () => {
    const results = calculateHierarchicalAHP({
      criteriaWeights,
      alternativeScores,
      alternatives: project.alternatives
    });
    setFinalResults(results);
    setProject(prev => ({ ...prev, status: 'completed' }));
  };

  const resetProject = () => {
    setProject({
      id: `project-${Date.now()}`,
      name: '',
      description: '',
      goal: '',
      criteria: [],
      alternatives: [],
      status: 'setup'
    });
    setCriteriaWeights({});
    setAlternativeScores({});
    setCurrentCriterionIndex(0);
    setFinalResults(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AHP Decision Analysis</h1>
        <p className="text-gray-600">Analytic Hierarchy Process for Multi-Criteria Decision Making</p>
      </div>

      {/* Step 1: Project Setup */}
      {project.status === 'setup' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 1: Project Setup</h2>
          
          {/* Project Info */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal/Objective
              </label>
              <input
                type="text"
                value={project.goal}
                onChange={(e) => setProject(prev => ({ ...prev, goal: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What decision are you trying to make?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={project.description}
                onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your project"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Criteria */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Criteria ({project.criteria.length})
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add criterion"
                />
                <button
                  onClick={addCriterion}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.criteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{criterion.name}</span>
                    <button
                      onClick={() => removeCriterion(criterion.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {project.criteria.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No criteria added yet</p>
                )}
              </div>
            </div>

            {/* Alternatives */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Alternatives ({project.alternatives.length})
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newAlternative}
                  onChange={(e) => setNewAlternative(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAlternative()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add alternative"
                />
                <button
                  onClick={addAlternative}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.alternatives.map((alternative) => (
                  <div key={alternative.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{alternative.name}</span>
                    <button
                      onClick={() => removeAlternative(alternative.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {project.alternatives.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No alternatives added yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={startComparison}
              disabled={project.criteria.length < 2 || project.alternatives.length < 2}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                project.criteria.length >= 2 && project.alternatives.length >= 2
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Pairwise Comparison →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Criteria Comparison */}
      {project.status === 'criteria-comparison' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Step 2: Compare Criteria</h2>
            <button
              onClick={() => setProject(prev => ({ ...prev, status: 'setup' }))}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Setup
            </button>
          </div>
          <PairwiseComparisonMatrix
            elements={project.criteria}
            title="Criteria Comparison"
            onComplete={handleCriteriaComparison}
          />
        </div>
      )}

      {/* Step 3: Alternatives Comparison */}
      {project.status === 'alternatives-comparison' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Step 3: Compare Alternatives
            </h2>
            <p className="text-gray-600">
              Criterion {currentCriterionIndex + 1} of {project.criteria.length}: 
              <span className="font-semibold ml-2">
                {project.criteria[currentCriterionIndex].name}
              </span>
            </p>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              {project.criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className={`flex-1 h-2 rounded-full ${
                    index < currentCriterionIndex
                      ? 'bg-green-500'
                      : index === currentCriterionIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <PairwiseComparisonMatrix
            elements={project.alternatives}
            title={`Compare alternatives with respect to: ${project.criteria[currentCriterionIndex].name}`}
            onComplete={(results) => 
              handleAlternativesComparison(project.criteria[currentCriterionIndex].id, results)
            }
          />
        </div>
      )}

      {/* Step 4: Results */}
      {project.status === 'completed' && finalResults && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Final Results</h2>
            <button
              onClick={resetProject}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              New Analysis
            </button>
          </div>
          <AHPResultsVisualization
            project={project}
            results={finalResults}
            criteriaWeights={criteriaWeights}
            alternativeScores={alternativeScores}
          />
        </div>
      )}
    </div>
  );
};

export default AHPProjectManager;