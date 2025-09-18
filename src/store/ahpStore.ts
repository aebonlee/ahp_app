// =============================================================================
// AHP Enterprise Platform - AHP Calculation Store (3차 개발)
// =============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  ComparisonMatrix, 
  AHPResults, 
  MatrixValidation, 
  WeightCalculation,
  APIResponse 
} from '../types';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://ahp-app-vuzk.onrender.com/api/v1';

interface AHPState {
  // State
  comparisonMatrices: ComparisonMatrix[];
  currentMatrix: ComparisonMatrix | null;
  results: AHPResults | null;
  isCalculating: boolean;
  error: string | null;
  
  // Validation state
  validationResults: Record<string, MatrixValidation>;
  
  // Actions
  createMatrix: (projectId: string, type: 'criteria' | 'alternatives', size: number, parentCriteriaId?: string) => ComparisonMatrix;
  updateMatrixValue: (matrixId: string, i: number, j: number, value: number) => void;
  saveMatrix: (matrix: ComparisonMatrix) => Promise<void>;
  loadMatrices: (projectId: string, evaluatorId?: string) => Promise<void>;
  
  // Validation
  validateMatrix: (matrix: number[][]) => MatrixValidation;
  calculateWeights: (matrix: number[][]) => WeightCalculation;
  
  // Results
  calculateAHPResults: (projectId: string) => Promise<void>;
  loadResults: (projectId: string) => Promise<void>;
  
  // Utilities
  setCurrentMatrix: (matrix: ComparisonMatrix | null) => void;
  clearError: () => void;
  reset: () => void;
}

// AHP 계산 유틸리티 함수들
const AHPUtils = {
  // 일관성 랜덤 인덱스 (Random Index)
  RI: [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49],
  
  // 고유벡터 계산 (power method)
  calculateEigenVector: (matrix: number[][]): number[] => {
    const n = matrix.length;
    let vector = new Array(n).fill(1);
    
    for (let iter = 0; iter < 100; iter++) {
      const newVector = new Array(n).fill(0);
      
      // 행렬 곱셈
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newVector[i] += matrix[i][j] * vector[j];
        }
      }
      
      // 정규화
      const sum = newVector.reduce((a, b) => a + b, 0);
      for (let i = 0; i < n; i++) {
        newVector[i] /= sum;
      }
      
      // 수렴 확인
      const diff = vector.reduce((sum, val, i) => sum + Math.abs(val - newVector[i]), 0);
      if (diff < 0.0001) break;
      
      vector = newVector;
    }
    
    return vector;
  },
  
  // 최대 고유값 계산
  calculateMaxEigenValue: (matrix: number[][], weights: number[]): number => {
    const n = matrix.length;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      for (let j = 0; j < n; j++) {
        rowSum += matrix[i][j] * weights[j];
      }
      sum += rowSum / weights[i];
    }
    
    return sum / n;
  },
  
  // 일관성 비율 계산
  calculateConsistencyRatio: (matrix: number[][]): number => {
    const n = matrix.length;
    if (n <= 2) return 0;
    
    const weights = AHPUtils.calculateEigenVector(matrix);
    const maxEigenValue = AHPUtils.calculateMaxEigenValue(matrix, weights);
    const CI = (maxEigenValue - n) / (n - 1);
    const RI = AHPUtils.RI[n] || 1.49;
    
    return CI / RI;
  }
};

const useAHPStore = create<AHPState>()(
  devtools(
    (set, get) => ({
      // Initial State
      comparisonMatrices: [],
      currentMatrix: null,
      results: null,
      isCalculating: false,
      error: null,
      validationResults: {},

      // Create Matrix
      createMatrix: (projectId: string, type: 'criteria' | 'alternatives', size: number, parentCriteriaId?: string): ComparisonMatrix => {
        const matrix: ComparisonMatrix = {
          id: `temp_${Date.now()}`,
          projectId,
          type,
          parentCriteriaId,
          matrix: Array(size).fill(null).map(() => Array(size).fill(1)),
          size,
          consistencyRatio: 0,
          isConsistent: true,
          evaluatorId: '', // 현재 사용자 ID로 설정 필요
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // 대각선 위의 값들만 1로 초기화, 대각선 아래는 역수로 설정
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if (i === j) {
              matrix.matrix[i][j] = 1;
            } else if (i < j) {
              matrix.matrix[i][j] = 1;
            } else {
              matrix.matrix[i][j] = 1 / matrix.matrix[j][i];
            }
          }
        }
        
        set((state) => ({
          comparisonMatrices: [...state.comparisonMatrices, matrix],
          currentMatrix: matrix,
        }));
        
        return matrix;
      },

      // Update Matrix Value
      updateMatrixValue: (matrixId: string, i: number, j: number, value: number) => {
        set((state) => {
          const updatedMatrices = state.comparisonMatrices.map(matrix => {
            if (matrix.id === matrixId) {
              const newMatrix = matrix.matrix.map(row => [...row]);
              
              // 입력된 값 설정
              newMatrix[i][j] = value;
              
              // 대칭 위치에 역수 설정 (대각선이 아닌 경우)
              if (i !== j) {
                newMatrix[j][i] = 1 / value;
              }
              
              // 일관성 비율 계산
              const consistencyRatio = AHPUtils.calculateConsistencyRatio(newMatrix);
              
              return {
                ...matrix,
                matrix: newMatrix,
                consistencyRatio,
                isConsistent: consistencyRatio <= 0.1,
                updatedAt: new Date().toISOString(),
              };
            }
            return matrix;
          });
          
          const updatedCurrentMatrix = state.currentMatrix?.id === matrixId 
            ? updatedMatrices.find(m => m.id === matrixId) || null
            : state.currentMatrix;
          
          return {
            comparisonMatrices: updatedMatrices,
            currentMatrix: updatedCurrentMatrix,
          };
        });
      },

      // Save Matrix
      saveMatrix: async (matrix: ComparisonMatrix) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.post(`${API_BASE}/comparisons/`, {
            projectId: matrix.projectId,
            type: matrix.type,
            parentCriteriaId: matrix.parentCriteriaId,
            matrix: matrix.matrix,
            consistencyRatio: matrix.consistencyRatio,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const savedMatrix = { ...matrix, ...response.data.data };
            
            set((state) => ({
              comparisonMatrices: state.comparisonMatrices.map(m => 
                m.id === matrix.id ? savedMatrix : m
              ),
              currentMatrix: state.currentMatrix?.id === matrix.id ? savedMatrix : state.currentMatrix,
            }));
          } else {
            throw new Error(response.data.message || 'Failed to save matrix');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to save matrix',
          });
        }
      },

      // Load Matrices
      loadMatrices: async (projectId: string, evaluatorId?: string) => {
        set({ isCalculating: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const url = evaluatorId 
            ? `${API_BASE}/projects/${projectId}/comparisons/?evaluator=${evaluatorId}`
            : `${API_BASE}/projects/${projectId}/comparisons/`;
            
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set({
              comparisonMatrices: response.data.data || [],
              isCalculating: false,
            });
          } else {
            throw new Error(response.data.message || 'Failed to load matrices');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to load matrices',
            isCalculating: false,
          });
        }
      },

      // Validate Matrix
      validateMatrix: (matrix: number[][]): MatrixValidation => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const n = matrix.length;
        
        // 크기 확인
        if (n < 2) {
          errors.push('행렬 크기가 너무 작습니다 (최소 2x2)');
        }
        
        if (n > 10) {
          warnings.push('행렬 크기가 큽니다. 일관성 유지가 어려울 수 있습니다.');
        }
        
        // 대각선 확인
        for (let i = 0; i < n; i++) {
          if (Math.abs(matrix[i][i] - 1) > 0.001) {
            errors.push(`대각선 요소 [${i+1},${i+1}]이 1이 아닙니다`);
          }
        }
        
        // 상호 역수 관계 확인
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const expected = 1 / matrix[i][j];
            if (Math.abs(matrix[j][i] - expected) > 0.001) {
              errors.push(`요소 [${j+1},${i+1}]이 [${i+1},${j+1}]의 역수가 아닙니다`);
            }
          }
        }
        
        // 일관성 비율 계산
        const consistencyRatio = AHPUtils.calculateConsistencyRatio(matrix);
        
        if (consistencyRatio > 0.1) {
          warnings.push(`일관성 비율이 높습니다 (${(consistencyRatio * 100).toFixed(1)}%). 10% 이하로 조정하세요.`);
        }
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          consistencyRatio,
        };
      },

      // Calculate Weights
      calculateWeights: (matrix: number[][]): WeightCalculation => {
        const weights = AHPUtils.calculateEigenVector(matrix);
        const maxEigenValue = AHPUtils.calculateMaxEigenValue(matrix, weights);
        const n = matrix.length;
        const consistencyIndex = (maxEigenValue - n) / (n - 1);
        const randomIndex = AHPUtils.RI[n] || 1.49;
        const consistencyRatio = consistencyIndex / randomIndex;
        
        return {
          weights,
          eigenVector: weights,
          maxEigenValue,
          consistencyIndex,
          consistencyRatio,
        };
      },

      // Calculate AHP Results
      calculateAHPResults: async (projectId: string) => {
        set({ isCalculating: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.post(`${API_BASE}/projects/${projectId}/calculate/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set({
              results: response.data.data,
              isCalculating: false,
            });
          } else {
            throw new Error(response.data.message || 'Failed to calculate results');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to calculate results',
            isCalculating: false,
          });
        }
      },

      // Load Results
      loadResults: async (projectId: string) => {
        set({ isCalculating: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`${API_BASE}/projects/${projectId}/results/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set({
              results: response.data.data,
              isCalculating: false,
            });
          } else {
            throw new Error(response.data.message || 'Failed to load results');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to load results',
            isCalculating: false,
          });
        }
      },

      // Set Current Matrix
      setCurrentMatrix: (matrix: ComparisonMatrix | null) => {
        set({ currentMatrix: matrix });
      },

      // Clear Error
      clearError: () => set({ error: null }),

      // Reset Store
      reset: () => set({
        comparisonMatrices: [],
        currentMatrix: null,
        results: null,
        isCalculating: false,
        error: null,
        validationResults: {},
      }),
    }),
    {
      name: 'AHPStore',
    }
  )
);

export default useAHPStore;