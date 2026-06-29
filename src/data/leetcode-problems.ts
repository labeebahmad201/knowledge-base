export interface LeetCodeProblem {
  id: number
  title: string
  slug: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  path: string
}

const problems: LeetCodeProblem[] = [
  {
    id: 242,
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'Easy',
    tags: ['Hash Map', 'Sorting', 'Array', 'String'],
    path: '/docs/computer-science/leetcode/lc-242-valid-anagram',
  },
  {
    id: 347,
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    difficulty: 'Medium',
    tags: ['Hash Map', 'Heap', 'Sorting', 'Array'],
    path: '/docs/computer-science/leetcode/lc-347-top-k-frequent-elements',
  },
  {
    id: 271,
    title: 'Encode and Decode Strings',
    slug: 'encode-and-decode-strings',
    difficulty: 'Medium',
    tags: ['String', 'Design'],
    path: '/docs/computer-science/leetcode/lc-271-encode-and-decode-strings',
  },
  {
    id: 238,
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    tags: ['Array', 'Prefix Sum'],
    path: '/docs/computer-science/leetcode/lc-238-product-of-array-except-self',
  },
  {
    id: 36,
    title: 'Valid Sudoku',
    slug: 'valid-sudoku',
    difficulty: 'Medium',
    tags: ['Hash Map', 'Set', 'Array', 'Matrix'],
    path: '/docs/computer-science/leetcode/lc-36-valid-sudoku',
  },
]

export default problems
