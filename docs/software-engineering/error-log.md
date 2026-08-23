# Error Log: Hand-Coding Sessions

Tracking errors encountered and their fixes during daily hand-coding sessions.

---

### EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@nestjs'

**Command:** `npm install -g @nestjs/cli`

**Full error:**
```
EACCES npm error syscall mkdir
npm error path /usr/local/lib/node_modules/@nestjs
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@nestjs'
```

**Cause:** `/usr/local/lib/` is owned by `root`. When you run `npm install -g`, npm tries to write to a root-owned directory. This happens if you previously ran `sudo npm install -g` or if Homebrew's node defaults to that location.

**Fix:**
```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Why `chown`:** `chown` changes the owner of a file or directory. Since `/usr/local/lib/` is owned by `root`, your regular user can't write to it. `chown -R $(whoami)` recursively changes ownership to your user, so you can install global npm packages without `sudo`. Done once, permanent.

**Prevention:** Run the `chown` fix above once — it's permanent.
