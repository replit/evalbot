const supportedLanguages = [
  'C#',
  'C',
  'C++',
  'C++ 11',
  'F#',
  'Java',
  'Nodejs',
  'PHP',
  'Python',
  'Python 3',
  'Ruby',
  'Rust',
  'Swift',
]

const languagesAliases = {
  python3: 'python3',
  python: 'python',
  ruby: 'ruby',
  php: 'php',
  nodejs: 'nodejs',
  node: 'nodejs',
  javascript: 'nodejs',
  js: 'nodejs',
  java: 'java',
  cpp11: 'cpp11',
  'c++11': 'cpp11',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  csharp: 'csharp',
  'c#': 'csharp',
  fsharp: 'fsharp',
  'f#': 'fsharp',
  'rust': 'rust',
  'swift': 'swift',
}

export function getLanguageKey(message = '') {
  const language = message.replace(/\s/g, '').toLowerCase()
  return languagesAliases[language]
}
export function getSupportedLanguages() {
  return supportedLanguages.join(',\n')
}
