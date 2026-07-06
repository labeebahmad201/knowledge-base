# LC-271 — Encode and Decode Strings

## Problem

Design an algorithm to encode a list of strings into a single string, and decode it back to the original list of strings.

> The encoded string should be self-delimiting — no external metadata should be required to reconstruct the original list.

### Constraints

- `0 <= strs.length <= 100`
- `0 <= strs[i].length <= 200`
- `strs[i]` contains any possible character (including `#`).

---

## Solution 1: Length-prefix encoding with `#` delimiters

```python
class Solution:

    def encode(self, strs: List[str]) -> str:
        arr = []
        for string in strs:
            arr.append('#' + str(len(string)) + '#' + string)
        return ''.join(arr)

    def decode(self, s: str) -> List[str]:
        i = 0
        output = []
        while i < len(s):
            num_arr = []
            if s[i] == '#':
                i += 1
                while i < len(s) and s[i] != '#':
                    num_arr.append(s[i])
                    i += 1
            characters_to_read = int(''.join(num_arr))
            i += 1
            output.append(s[i: i + characters_to_read])
            i = i + characters_to_read
        return output
```

- **Time:** O(n) — single pass for encoding, single pass for decoding.
- **Space:** O(n) — the encoded string is proportional to the sum of input lengths plus overhead for delimiters.
- **Pattern:** Delimiter-based encoding with escape via length prefix.

### How it works

Each string is encoded as `#<length>#<string>`. The `#` serves as a delimiter, but since the length is encoded between two `#`s, the decoder knows exactly how many characters to read — even if the string itself contains `#`.

**Encoding:**
```
Input: ["hello", "world"]
Encoded: "#5#hello#5#world"
```

**Decoding:**
1. Find `#`, read digits until next `#` → get length (e.g., `5`)
2. Read that many characters → get the original string (`"hello"`)
3. Repeat until end of input

### Why a simple delimiter doesn't work

A naive approach (e.g., joining with `#` and splitting on `#`) breaks if `#` appears in the input. By prefixing each string with its length, the decoder reads exactly `n` characters and never needs to inspect the string content.

### Key Python details

- `str(len(string))` — `len()` returns an `int`, which cannot be concatenated with a string directly. `str()` converts it so that `'#' + str(len(s)) + '#' + s` works.
- `int(''.join(num_arr))` — the length digits are collected as individual characters, joined into a string, then parsed as an integer.
- `''.join(arr)` — joins the list of encoded string pieces into one string efficiently.
- `list.append()` — adds elements to the end of a list (encoding: building `arr`; decoding: building `num_arr` and `output`).
- `s[i: i + n]` — Python slice that extracts `n` characters starting at index `i`. If `i + n` exceeds the string length, Python silently returns fewer characters.

---

## Revision notes

- Simple delimiters fail when the delimiter character appears in the input string.
- Length-prefix encoding is self-delimiting — the decoder reads exactly `n` characters, so string content is irrelevant.
- `str()` and `int()` bridge the type conversion between integer length and string concatenation.
- `''.join()` is the idiomatic way to assemble strings from a list.
- Guard `i < len(s)` before `s[i]` in while conditions to avoid index-out-of-bounds.
