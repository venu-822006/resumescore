export interface TechTopic {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'System Design' | 'Soft Skills' | 'Data' | 'Cloud/DevOps';
  concepts: string[];
}

export const TECH_TOPICS: TechTopic[] = [
  {
    id: 'react',
    name: 'React.js',
    category: 'Frontend',
    concepts: ['Hooks', 'Virtual DOM', 'State Management', 'Server Components', 'Reconciliation', 'Memoization']
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Backend',
    concepts: ['Event Loop', 'Streams', 'Buffers', 'Express', 'Async/Await', 'Worker Threads']
  },
  {
    id: 'sys-design',
    name: 'System Design',
    category: 'System Design',
    concepts: ['Load Balancing', 'Caching', 'Sharding', 'Microservices', 'CAP Theorem', 'Eventual Consistency']
  },
  {
    id: 'python',
    name: 'Python / Data Science',
    category: 'Data',
    concepts: ['Pandas', 'NumPy', 'Scikit-learn', 'Deep Learning', 'Data Pipelines', 'Feature Engineering']
  },
  {
    id: 'aws',
    name: 'AWS / Cloud',
    category: 'Cloud/DevOps',
    concepts: ['EC2/S3', 'Lambda', 'IAM', 'VPC', 'Terraform', 'CI/CD Pipelines']
  },
  {
    id: 'sql',
    name: 'SQL & Databases',
    category: 'Backend',
    concepts: ['Indexing', 'Normalization', 'ACID Properties', 'Joins', 'Stored Procedures', 'Query Optimization']
  }
];

export const PERSONAS = [
  { id: 'senior-dev', name: 'Lead Engineer (Architectural)', description: 'Focuses deep on edge cases, scalability, and clean code principles.' },
  { id: 'hr-manager', name: 'Talent Acquisition (Culture & Growth)', description: 'Evaluates soft skills, teamwork, motivation, and career trajectory.' },
  { id: 'cto', name: 'CTO (Strategic Impact)', description: 'High-level focus on business value, technical trade-offs, and vision.' },
  { id: 'product-manager', name: 'Product Manager (User-Centric)', description: 'Evaluates how you balance technical constraints with user needs.' }
];

export const EVALUATION_RUBRICS = {
  communication: [
    'Articulation and Clarity',
    'Active Listening & Clarifying Questions',
    'Structuring Answers (STAR method)',
    'Confidence and Pacing',
    'Enthusiasm and Narrative Flow'
  ],
  resume: [
    'Quantifiable Business Impact',
    'Technical Stack Precision',
    'ATS (Applicant Tracking System) Readiness',
    'Action-Oriented Language',
    'Visual Hierarchy and Readability'
  ],
  portfolio: [
    'Project Narrative (The "Why")',
    'UX/UI Polish and Responsiveness',
    'Code Readability/Github Links',
    'Live Demo Reliability',
    'Personal Branding Consistency'
  ]
};
