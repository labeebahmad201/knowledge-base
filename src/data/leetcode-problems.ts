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
]

export default problems
