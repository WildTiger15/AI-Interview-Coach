# Technical Interview Tips (Software Engineering)

## Before you start coding
- Restate the problem in your own words to confirm you understand it.
- Ask clarifying questions: input size/range, edge cases (empty input,
  duplicates, negative numbers), expected complexity, whether you can
  mutate inputs.
- Think out loud. Interviewers are evaluating your reasoning process, not
  just the final answer — silence is the biggest mistake candidates make.

## While solving
- Start with a brute-force approach if you're stuck, then optimize. A
  working O(n²) solution beats a broken O(n log n) one.
- State the time/space complexity of your approach before and after
  optimizing.
- Write clean, readable code: meaningful variable names, small functions.
  Interviewers read code the way they'd read a teammate's PR.
- Trace through at least one example by hand before declaring you're done.

## System design questions
- Clarify requirements and scale first (users, requests/sec, data size)
  before drawing anything.
- Start with a simple high-level design, then go deeper into the components
  the interviewer probes on.
- Talk about trade-offs explicitly (consistency vs. availability, latency vs.
  cost) rather than presenting one "correct" design.

## General technical-round etiquette
- It's fine to say "I don't know" and reason from first principles — that's
  better than guessing confidently and being wrong.
- If you get stuck, narrate what you're trying and why, so the interviewer
  can nudge you instead of watching you sit in silence.
- Manage your time: if a question has multiple parts, don't spend all your
  time perfecting part one.
