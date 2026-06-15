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
]

export default problems
