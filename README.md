# 🫀 Cordex

### *A programming language with a heartbeat*

> Write code in English, Hinglish, or Cardiology — Cordex understands all three.
---

## 🤯 What is Cordex?

**Cordex** is a custom-built interpreted programming language written in Python. It supports three flavours of syntax — standard English, Desi-Indian Hinglish, and a Cardiology-themed dialect — all running on the same compiler pipeline.

Think of it as Python's cooler, desi cousin who also happens to be a cardiologist. 🩺

---

## ✨ Features

- 🧠 **Multi-dialect syntax** — English, Hinglish & Cardiology keywords
- 🔁 **Loops** — `while` and `for` with `break` / `continue`
- 🌿 **Variables** — declare, reassign, `++` and `--`
- 🧮 **Expressions** — arithmetic, comparisons, string concatenation
- 📦 **Arrays** — create and iterate over lists
- 🔀 **Conditionals** — `if` / `else if` / `else` chains
- 🖨️ **Output** — `print()`, `bol()`, `monitor()` — your choice
- ⏱️ **Timeout protection** — infinite loops? we handle it (30s limit)
- 🔥 **Roast Mode** — get your errors served with savage commentary

---

## 🗣️ Three Ways to Write the Same Code

```cordex
# 🇬🇧 Standard English
let score = 95;
if(score > 90) {
    print("Excellent!")
} else {
    print("Try harder")
}
```

```cordex
# 🇮🇳 Desi Hinglish
rakho score = 95;
agar(score > 90) {
    bol("Ekdum fatafat! 🔥")
} warna {
    bol("Padhai kar bhai 😅")
}
```

```cordex
# 🏥 Cardiology Theme
diagnose(score > 90) {
    monitor("Heart is beating strong 💓")
} rediagnose {
    monitor("Flatline detected...")
}
```

---

## 🔤 Keyword Reference

| Concept | English | Hinglish | Cardiology |
|---|---|---|---|
| Variable | `let` | `rakho` | — |
| Print | `print` | `bol` / `sunao` | `monitor` |
| If | `if` | `agar` | `diagnose` |
| Else If | `else if` | `ya_phir` | `rediagnose` |
| Else | `else` | `warna` | `rediagnose` |
| While | `while` | `jab_tak` | `beating` |
| For | `for` | `baar_baar` | `scan` |
| Break | `break` | `bas` | — |
| Continue | `continue` | `aage_badh` | `bypass` |
| True | `true` | `sach` | `pulse` |
| False | `false` | `jhooth` | — |
| Null | `null` | `kuch_nahi` | `flatline` |

---

## 🚀 Syntax Guide

### 📌 Variables
```cordex
let x = 10;
let name = "Cordex";
let items = [1, 2, 3, 4, 5];
```

### ➕ Increment / Decrement
```cordex
x++   # x = x + 1
x--   # x = x - 1
```

### 🔀 Conditionals
```cordex
if(x > 10) {
    print("big")
} else if(x == 10) {
    print("exact")
} else {
    print("small")
}
```

### 🔁 While Loop
```cordex
let i = 0;
while(i < 5) {
    print(i);
    i++;
}
```

### 🔄 For Loop
```cordex
let nums = [10, 20, 30];
for i in nums {
    print(i);
}
```

### 🧵 String Concatenation
```cordex
let name = "Cordex";
print("Hello " + name + "!");
```

---

## 🏗️ Compiler Pipeline

```
Source Code (.cdx)
      │
      ▼
  🔍 Lexer          →  Tokenizes source into token stream
      │
      ▼
  🌳 Parser         →  Builds Abstract Syntax Tree (AST)
      │
      ▼
  🔬 Semantic       →  Checks undeclared variables, loop context
     Analyzer
      │
      ▼
  ⚙️  Interpreter   →  Tree-walk execution (iterative, no recursion)
      │
      ▼
   Output / Error
```

All stages are **pure Python**, **no external dependencies**, and use **explicit stacks** — zero recursion in the interpreter.

---

## 🔥 Roast Mode

Toggle **Roast Mode** on the playground and your errors come with personality:

> *"Oh no, looks like your code has a severe case of 'Syntax Dyslexia'. You might as well be trying to drive a car with the parking brake on and expecting to reach 60mph."* 💀

---

## 📁 Project Structure

```
cordex/
├── compiler/
│   ├── lexer.py            # Tokenizer
│   ├── parser.py           # AST builder
│   ├── semantic_analyzer.py # Variable & loop checker
│   ├── interpreter.py      # Tree-walk executor
│   └── pipeline.py         # compile_and_run entry point
├── backend/
│   └── runner.py           # Timeout wrapper (multiprocessing)
└── frontend/               # Cordex Web IDE
```

---

## 🛡️ Safety

- ⏱️ **30 second execution timeout** — infinite loops are killed automatically
- 🚫 **Division by zero** — caught at runtime with a friendly error
- 🔍 **Undeclared variable detection** — semantic analyzer catches it before execution
- 💔 **`break` / `continue` outside loops** — flagged before runtime

---

## For Documentation Visit:
👉:  **( https://cordex-jtfm.vercel.app/docs )**

---
## 🌐 Try It Live

👉 **[cordex-jtfm.vercel.app](https://cordex-jtfm.vercel.app)**

---


## 🧑‍💻 Author

Built with ❤️ and a lot of chai ☕ by a developer who wanted to make coding feel more *easy*.

---

by Praveen Achary Vishwabramham

