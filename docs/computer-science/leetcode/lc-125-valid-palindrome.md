# LC-125 — Valid Palindrome

## Problem

Given a string `s`, return `true` if it is a **palindrome**, or `false` otherwise.

> A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.
>
> Alphanumeric characters include letters and numbers.

### Constraints

- `1 <= s.length <= 2 * 10^5`
- `s` consists only of **printable ASCII** characters.

---

## Solution: Two-pointer with skipping

```python
class Solution:
    def isPalindrome(self, s: str) -> bool:

        def isAlphaNumeric(char: str) -> bool:
            ascii_num = ord(char.lower())
            return ord('a') <= ascii_num <= ord('z') \
                    or ord('0') <= ascii_num <= ord('9')

        left = 0
        right = len(s) - 1

        while left < right:
            while left < right and not isAlphaNumeric(s[left]):
                left += 1

            while right >= 0 and not isAlphaNumeric(s[right]):
                right -= 1

            if left < right and s[left].lower() != s[right].lower():
                return False

            left += 1
            right -= 1

        return True
```

- **Time:** O(n) — each character is visited at most once.
- **Space:** O(1) — only two pointers.
- **Pattern:** Two-pointer, character filtering.

---

## Common mistakes

### 1. Syntax errors

| Mistake | Example | Why it's wrong | Corrected |
| :--- | :--- | :--- | :--- |
| **Missing left operand in chained comparison** | `ord('a') >= ascii_num and <= ord('z')` | The second `<=` has no left operand. Python raises `SyntaxError`. | `ascii_num >= ord('a') and ascii_num <= ord('z')` |
| **Calling `len()` on an integer** | `while not isAlphaNumeric(s[left]) and left < len(left):` | `left` is an integer; `len(0)` raises `TypeError`. | `while left < right and not isAlphaNumeric(s[left]):` |

### 2. Logic errors (comparison direction & case sensitivity)

| Mistake | Example | Why it's wrong | Corrected |
| :--- | :--- | :--- | :--- |
| **Reversed letter bounds** | `ord('a') >= ascii_num` | `'b'` (98) → `97 >= 98` is `False`, rejecting valid letters. | `ascii_num >= ord('a')` |
| **Reversed digit bounds** | `ord('0') >= ascii_num` | `'1'` (49) → `48 >= 49` is `False`, rejecting digits `1-9`. | `ascii_num >= ord('0')` |
| **Forgetting `.lower()` when comparing** | `if s[left] != s[right]:` | `'A' != 'a'` is `False`, failing case-insensitive check. | `if s[left].lower() != s[right].lower():` |

### 3. Boundary & edge-case issues

| Mistake | Example | Why it's wrong | Corrected |
| :--- | :--- | :--- | :--- |
| **Left-skipping loop runs past `right`** | `while left < len(s) and not isAlphaNumeric(s[left]):` | On `"!!!"`, `left` goes to `len(s)`, risking `IndexError`. | `while left < right and not isAlphaNumeric(s[left]):` |
| **Right-skipping loop goes to `-1`** | `while right >= 0 and not isAlphaNumeric(s[right]):` | On `"!!!"`, `right` goes to `-1`. Works but is asymmetric. | `while left < right and not isAlphaNumeric(s[right]):` |
| **Unsafe boundary check** | `if left <= len(s) and ...` | `left <= len(s)` allows `IndexError` when `left == len(s)`. | `if left < right and ...` |

### 4. Minor issues

| Mistake | Example | Why it's not ideal | Better |
| :--- | :--- | :--- | :--- |
| **Typo in function name** | `def isAlphaNumerci(...)` | Confusing to read. | `def isAlphaNumeric(...)` |
| **Using `\` for line continuation** | `return ... \ or ...` | Fragile (trailing space breaks it). Prefer parentheses. | Wrap in parentheses or use chained comparisons |
| **Forgetting pointer updates** | Missing `left += 1` / `right -= 1` | Loop never progresses, infinite loop. | Always advance pointers after comparison |

---

## Key takeaways

- Use `left < right` as the loop guard — never `left <= len(s)` or `right >= 0` alone.
- Python's chained comparisons (`ord('a') <= x <= ord('z')`) are both readable and safe.
- Always `.lower()` both sides when comparing case-insensitively.
- The two-pointer skip pattern handles non-alphanumeric characters without extra space.

---

## Techniques

- [Two-Pointer](techniques#two-pointer)
