// Excel functionality temporarily disabled for security

interface ExportOptions {
  format: 'csv' | 'excel';
  includeWeights?: boolean;
  includeDescriptions?: boolean;
}

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  order?: number;
  weight?: number;
  children?: Criterion[];
}

const flattenCriteria = (criteria: Criterion[]): any[] => {
  const result: any[] = [];
  
  const process = (items: Criterion[], parentName: string = '') => {
    items.forEach(item => {
      const row = {
        level: item.level,
        name: item.name,
        description: item.description || '',
        parent: parentName,
        weight: item.weight || 1
      };
      result.push(row);
      
      if (item.children && item.children.length > 0) {
        process(item.children, item.name);
      }
    });
  };
  
  process(criteria);
  return result;
};

const exportService = {
  async exportCriteria(projectId: string, criteria: Criterion[], options: ExportOptions) {
    const flatData = flattenCriteria(criteria);
    
    const fields = ['level', 'name'];
    if (options.includeDescriptions) fields.push('description');
    if (options.includeWeights) fields.push('weight');
    fields.push('parent');

    if (options.format === 'csv') {
      const csvContent = [
        fields.join(','),
        ...flatData.map(row => 
          fields.map(field => `"${row[field]}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `criteria_${projectId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Excel functionality temporarily disabled for security
      console.warn('Excel export is temporarily disabled for security reasons. Falling back to CSV.');
      const csvContent = [
        fields.join(','),
        ...flatData.map(row => 
          fields.map(field => `"${row[field]}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `criteria_${projectId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  },

  async exportResults(projectId: string, format: 'csv' | 'excel', results: any[]) {
    const flatData = results.map(result => ({
      alternative: result.alternative_name,
      score: result.final_score,
      rank: result.rank
    }));

    if (format === 'csv') {
      const csvContent = [
        'Alternative,Score,Rank',
        ...flatData.map(row => 
          `"${row.alternative}",${row.score},${row.rank}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${projectId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Excel functionality temporarily disabled for security
      console.warn('Excel export is temporarily disabled for security reasons. Falling back to CSV.');
      const csvContent = [
        'Alternative,Score,Rank',
        ...flatData.map(result => `"${result.alternative}","${result.score}","${result.rank}"`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${projectId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  },

  async exportAlternatives(projectId: string, alternatives: any[], format: 'csv' | 'excel') {
    const flatData = alternatives.map((alt, index) => ({
      id: alt.id || `alt_${index + 1}`,
      name: alt.name,
      description: alt.description || ''
    }));

    if (format === 'csv') {
      const csvContent = [
        'ID,Name,Description',
        ...flatData.map(row => 
          `"${row.id}","${row.name}","${row.description}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alternatives_${projectId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Excel functionality temporarily disabled for security
      console.warn('Excel export is temporarily disabled for security reasons. Falling back to CSV.');
      const csvContent = [
        'ID,Name,Description',
        ...flatData.map(alt => `"${alt.id}","${alt.name}","${alt.description}"`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alternatives_${projectId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
};

export default exportService;