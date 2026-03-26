# semantic_analyzer.py

# ── State ─────────────────────────────────────────────────
scope_stack = [set()]   # global scope at bottom
loop_depth  = 0
errors      = []

BOOL_NULL_LITERALS = {'true', 'false', 'null'}

# ── Scope Helpers ─────────────────────────────────────────

def enter_scope():
    scope_stack.append(set())

def exit_scope():
    if len(scope_stack) > 1:
        scope_stack.pop()

def declare(name):
    scope_stack[-1].add(name)  # allow re-declaration (interpreter allows reassignment)

def resolve(name):
    for scope in reversed(scope_stack):
        if name in scope:
            return
    errors.append(f"Undeclared variable '{name}'")

# ── Expression Helper ─────────────────────────────────────

def push_expr(expr, work_stack):
    if isinstance(expr, dict):
        work_stack.append(expr)
    elif isinstance(expr, str):
        if expr in BOOL_NULL_LITERALS:
            return
        work_stack.append({'type': 'IDENT', 'value': expr})
    # int/float literals — skip

# ── Main Analyze Function ─────────────────────────────────

def analyze(ast):
    global loop_depth, errors, scope_stack
    loop_depth  = 0          # reset state on every call
    errors      = []
    scope_stack = [set()]

    work_stack = []

    for stmt in reversed(ast.get('body', [])):
        work_stack.append(stmt)

    while work_stack:
        node = work_stack.pop()

        # ── Sentinels ──────────────────────────────────
        if isinstance(node, tuple):
            if node[0] == 'ENTER_SCOPE':
                enter_scope()
            elif node[0] == 'EXIT_SCOPE':
                exit_scope()
            elif node[0] == 'EXIT_LOOP':
                loop_depth -= 1
            elif node[0] == 'DECLARE':
                declare(node[1])
            continue

        if not isinstance(node, dict):
            continue

        t = node.get('type')

        # ── LetStatement ───────────────────────────────
        if t == 'LetStatement':
            declare(node['name'])
            push_expr(node.get('value'), work_stack)

        # ── IfStatement ────────────────────────────────
        elif t == 'IfStatement':
            if node.get('else_body'):
                work_stack.append(('EXIT_SCOPE',))
                for stmt in reversed(node['else_body']):
                    work_stack.append(stmt)
                work_stack.append(('ENTER_SCOPE',))

            for clause in reversed(node.get('elif_clauses', [])):
                work_stack.append(('EXIT_SCOPE',))
                for stmt in reversed(clause['body']):
                    work_stack.append(stmt)
                push_expr(clause['condition'], work_stack)
                work_stack.append(('ENTER_SCOPE',))

            work_stack.append(('EXIT_SCOPE',))
            for stmt in reversed(node['body']):
                work_stack.append(stmt)
            push_expr(node['condition'], work_stack)
            work_stack.append(('ENTER_SCOPE',))

        # ── WhileStatement ─────────────────────────────
        elif t == 'WhileStatement':
            loop_depth += 1
            work_stack.append(('EXIT_LOOP',))
            work_stack.append(('EXIT_SCOPE',))
            for stmt in reversed(node['body']):
                work_stack.append(stmt)
            push_expr(node['condition'], work_stack)
            work_stack.append(('ENTER_SCOPE',))

        # ── ForStatement ───────────────────────────────
        elif t == 'ForStatement':
            loop_depth += 1
            resolve(node['iterable'])
            work_stack.append(('EXIT_LOOP',))
            work_stack.append(('EXIT_SCOPE',))
            for stmt in reversed(node['body']):
                work_stack.append(stmt)
            work_stack.append(('DECLARE', node['item']))
            work_stack.append(('ENTER_SCOPE',))

        # ── PrintStatement ─────────────────────────────
        elif t == 'PrintStatement':
            push_expr(node.get('value'), work_stack)

        # ── BinaryExpr ─────────────────────────────────
        elif t == 'BinaryExpr':
            push_expr(node.get('left'),  work_stack)
            push_expr(node.get('right'), work_stack)

        # ── IDENT ──────────────────────────────────────
        elif t == 'IDENT':
            resolve(node['value'])

        # ── BreakStatement ─────────────────────────────
        elif t == 'BreakStatement':
            if loop_depth == 0:
                errors.append("'break' used outside a loop")

        # ── ContinueStatement ──────────────────────────
        elif t == 'ContinueStatement':
            if loop_depth == 0:
                errors.append("'continue' used outside a loop")

    return errors