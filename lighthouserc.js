module.exports = {
  ci: {
    collect: {
      staticDistDir: './build',
      url: ['http://localhost:8080/'],
      numberOfRuns: 2,
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        skipAudits: ['uses-http2'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.6}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.8}],
        'categories:seo': ['warn', {minScore: 0.8}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};