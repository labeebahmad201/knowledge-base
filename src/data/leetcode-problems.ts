export interface LeetCodeProblem {
  id: number
  title: string
  slug: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  path: string
  type?: 'problem' | 'concept'
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
  {
    id: 125,
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    tags: ['Two Pointers', 'String'],
    path: '/docs/computer-science/leetcode/lc-125-valid-palindrome',
  },
  {
    id: 128,
    title: 'Longest Consecutive Sequence',
    slug: 'longest-consecutive-sequence',
    difficulty: 'Medium',
    tags: ['Hash Map', 'Set', 'Array', 'Union Find'],
    path: '/docs/computer-science/leetcode/lc-128-longest-consecutive-sequence',
  },
  {
    id: 1,
    title: 'Two Sum (Sorted)',
    slug: 'two-sum-sorted',
    difficulty: 'Medium',
    tags: ['Two Pointers', 'Array'],
    path: '/docs/computer-science/leetcode/lc-1-two-sum',
  },
  {
    id: 15,
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    tags: ['Two Pointers', 'Sorting', 'Array'],
    path: '/docs/computer-science/leetcode/lc-15-3sum',
  },
  {
    id: 11,
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    tags: ['Two Pointers', 'Array', 'Greedy'],
    path: '/docs/computer-science/leetcode/lc-11-container-with-most-water',
  },
  {
    id: 42,
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Prefix Sum'],
    path: '/docs/computer-science/leetcode/lc-42-trapping-rain-water',
  },
  {
    id: 121,
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    tags: ['Array', 'Greedy'],
    path: '/docs/computer-science/leetcode/lc-121-best-time-to-buy-and-sell-stock',
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    tags: ['Sliding Window', 'Hash Map', 'String'],
    path: '/docs/computer-science/leetcode/lc-3-longest-substring-without-repeating-characters',
  },
  {
    id: 424,
    title: 'Longest Repeating Character Replacement',
    slug: 'longest-repeating-character-replacement',
    difficulty: 'Medium',
    tags: ['Sliding Window', 'Hash Map', 'String'],
    path: '/docs/computer-science/leetcode/lc-424-longest-repeating-character-replacement',
  },
  {
    id: 0,
    title: 'Sliding Window — Max Frequency Tracking',
    slug: 'sliding-window-max-frequency',
    difficulty: 'Medium',
    tags: ['Concept', 'Sliding Window', 'Hash Map'],
    path: '/docs/computer-science/leetcode/lc-sliding-window-max-frequency',
    type: 'concept',
  },
  {
    id: 0,
    title: 'Greedy Algorithms',
    slug: 'greedy',
    difficulty: 'Medium',
    tags: ['Concept', 'Greedy'],
    path: '/docs/computer-science/leetcode/lc-greedy',
    type: 'concept',
  },
]

export default problems
