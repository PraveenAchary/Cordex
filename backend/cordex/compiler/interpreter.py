# interpreter.py — Cordex Tree-Walk Interpreter
# Style: procedural only, explicit stacks, no recursion, no classes

from .parser import parse

# ── Output & Error state ──────────────────────────────────
output      = []
error       = None

# ── Scope stack (list of dicts) ───────────────────────────
# Each scope is a plain dict {name: value}
# Top of stack = innermost scope
scope_stack = [{}]

def scope_declare(name, value):
    scope_stack[-1][name] = value

def scope_set(name, value):
    """Update an existing variable — walks up scope chain."""
    for scope in reversed(scope_stack):
        if name in scope:
            scope[name] = value
            return
    # if not found, declare in current scope (graceful fallback)
    scope_stack[-1][name] = value

def scope_get(name):
    for scope in reversed(scope_stack):
        if name in scope:
            return scope[name]
    return ('ERROR', f"Undeclared variable '{name}'")

def scope_enter():
    scope_stack.append({})

def scope_exit():
    if len(scope_stack) > 1:
        scope_stack.pop()

# ── Stringify helper ──────────────────────────────────────
def stringify(value):
    if value is True:  return 'true'
    if value is False: return 'false'
    if value is None:  return 'null'
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)

def is_truthy(value):
    if value is None or value is False or value == 0:
        return False
    return True

# ── Boolean/null literal resolver ─────────────────────────
def resolve_literal(name):
    """Return Python value if name is a Cordex literal, else None."""
    if name == 'true':  return True
    if name == 'false': return False
    if name == 'null':  return None
    return 'NOT_LITERAL'   # sentinel — not a literal

# ── Expression evaluator (iterative via eval_stack) ───────
def eval_expr(node):
    global error

    eval_stack  = [('EVAL', node)]
    value_stack = []

    while eval_stack:
        action, item = eval_stack.pop()

        if action == 'EVAL':
            # ── Raw Python int/float ──
            if isinstance(item, (int, float)):
                value_stack.append(item)

            # ── Raw Python bool ──
            elif isinstance(item, bool):
                value_stack.append(item)

            # ── Raw string (bare identifier or literal from parser) ──
            elif isinstance(item, str):
                lit = resolve_literal(item)
                if lit != 'NOT_LITERAL':
                    value_stack.append(lit)
                else:
                    val = scope_get(item)
                    if isinstance(val, tuple) and val[0] == 'ERROR':
                        error = val[1]
                        return None
                    value_stack.append(val)

            elif isinstance(item, dict):
                t = item.get('type')

                # ── IDENT node ──
                if t == 'IDENT':
                    name = item['value']
                    # FIX: check for boolean/null literals before scope lookup
                    lit = resolve_literal(name)
                    if lit != 'NOT_LITERAL':
                        value_stack.append(lit)
                    else:
                        val = scope_get(name)
                        if isinstance(val, tuple) and val[0] == 'ERROR':
                            error = val[1]
                            return None
                        value_stack.append(val)

                # ── BooleanLiteral node (if parser emits these) ──
                elif t == 'BooleanLiteral':
                    value_stack.append(item['value'])  # should be Python True/False

                # ── NullLiteral node (if parser emits these) ──
                elif t == 'NullLiteral':
                    value_stack.append(None)

                # ── StringLiteral node ──
                elif t == 'StringLiteral':
                    value_stack.append(item['value'])

                # ── NumberLiteral node (if parser emits these) ──
                elif t == 'NumberLiteral':
                    value_stack.append(item['value'])

                # ── ArrayLiteral node ──
                elif t == 'ArrayLiteral':
                    elements = []
                    for elem in item.get('elements', []):
                        val = eval_expr(elem)
                        if error:
                            return None
                        elements.append(val)
                    value_stack.append(elements)

                # ── BinaryExpr node ──
                elif t == 'BinaryExpr':
                    eval_stack.append(('APPLY', item['op']))
                    eval_stack.append(('EVAL', item['right']))
                    eval_stack.append(('EVAL', item['left']))

                # ── UnaryExpr node (e.g. !true, -x) ──
                elif t == 'UnaryExpr':
                    eval_stack.append(('UNARY', item['op']))
                    eval_stack.append(('EVAL', item['operand']))

                # ── Fallback ──
                else:
                    value_stack.append(None)
            else:
                value_stack.append(item)

        # ── APPLY: binary operator ─────────────────────────
        elif action == 'APPLY':
            op    = item
            right = value_stack.pop()
            left  = value_stack.pop()
            result = None

            if op == '+':
                if isinstance(left, str) or isinstance(right, str):
                    result = stringify(left) + stringify(right)
                else:
                    result = left + right
            elif op == '-':  result = left - right
            elif op == '*':  result = left * right
            elif op == '/':
                if right == 0:
                    error = "Division by zero — heart stopped!"
                    return None
                result = left / right
            elif op == '%':
                if right == 0:
                    error = "Modulo by zero — flatline!"
                    return None
                result = left % right
            elif op == '==': result = (left == right)
            elif op == '!=': result = (left != right)
            elif op == '<':  result = (left <  right)
            elif op == '>':  result = (left >  right)
            elif op == '<=': result = (left <= right)
            elif op == '>=': result = (left >= right)
            elif op == 'and': result = (is_truthy(left) and is_truthy(right))
            elif op == 'or':  result = (is_truthy(left) or  is_truthy(right))
            else:
                error = f"Unknown operator: {op}"
                return None

            value_stack.append(result)

        # ── UNARY: unary operator ──────────────────────────
        elif action == 'UNARY':
            op  = item
            val = value_stack.pop()
            if op == '!':
                value_stack.append(not is_truthy(val))
            elif op == '-':
                value_stack.append(-val)
            else:
                error = f"Unknown unary operator: {op}"
                return None

    return value_stack[0] if value_stack else None


# ── Main execute function (iterative via work_stack) ───────
def execute(ast):
    global output, error, scope_stack

    output      = []
    error       = None
    scope_stack = [{}]

    work_stack         = []
    unwinding_break    = False
    unwinding_continue = False

    for stmt in reversed(ast.get('body', [])):
        work_stack.append(('STMT', stmt))

    while work_stack:
        frame = work_stack.pop()
        tag   = frame[0]

        # ── Unwind break/continue ─────────────────────────
        if unwinding_break or unwinding_continue:
            if tag == 'SCOPE_EXIT':
                scope_exit()
            elif tag in ('WHILE_CHECK', 'FOR_ITER'):
                if unwinding_break:
                    unwinding_break = False
                else:
                    unwinding_continue = False
                    work_stack.append(frame)
            continue

        # ── SCOPE_EXIT ────────────────────────────────────
        if tag == 'SCOPE_EXIT':
            scope_exit()
            continue

        # ── LOOP_END marker ───────────────────────────────
        if tag == 'LOOP_END':
            continue

        # ── STMT ──────────────────────────────────────────
        if tag == 'STMT':
            node = frame[1]
            t    = node.get('type')

            if error:
                break

            # ── LetStatement ──
            if t == 'LetStatement':
                val  = eval_expr(node['value'])
                if error: break
                name = node['name']
                found = any(name in s for s in scope_stack)
                if found:
                    scope_set(name, val)
                else:
                    scope_declare(name, val)

            # ── PrintStatement ──
            elif t == 'PrintStatement':
                val = eval_expr(node['value'])
                if error: break
                line = stringify(val)
                output.append(line)
                print(line)

            # ── BreakStatement ──
            elif t == 'BreakStatement':
                unwinding_break = True

            # ── ContinueStatement ──
            elif t == 'ContinueStatement':
                unwinding_continue = True

            # ── IfStatement ──
            elif t == 'IfStatement':
                cond = eval_expr(node['condition'])
                if error: break

                chosen_body = None
                if is_truthy(cond):
                    chosen_body = node['body']
                else:
                    for clause in node.get('elif_clauses', []):
                        cv = eval_expr(clause['condition'])
                        if error: break
                        if is_truthy(cv):
                            chosen_body = clause['body']
                            break
                    if not chosen_body and node.get('else_body') is not None:
                        chosen_body = node['else_body']

                if error: break
                if chosen_body:
                    scope_enter()
                    work_stack.append(('SCOPE_EXIT',))
                    for stmt in reversed(chosen_body):
                        work_stack.append(('STMT', stmt))

            # ── WhileStatement ──
            elif t == 'WhileStatement':
                work_stack.append(('WHILE_CHECK', node['condition'], node['body']))

            # ── ForStatement ──
            elif t == 'ForStatement':
                # eval_expr handles both raw variable lookup and ArrayLiteral nodes
                iterable = eval_expr({'type': 'IDENT', 'value': node['iterable']})
                if error: break
                if not isinstance(iterable, list):
                    error = f"'{node['iterable']}' is not iterable"
                    break
                if iterable:
                    work_stack.append(('FOR_ITER', node['item'], iterable, 0, node['body']))
            else:
                if t is not None:
                    error = f"Unknown statement type: '{t}'"
                    break

        # ── WHILE_CHECK ───────────────────────────────────
        elif tag == 'WHILE_CHECK':
            _, cond_node, body = frame
            if error: break

            cond = eval_expr(cond_node)
            if error: break

            if is_truthy(cond):
                work_stack.append(('WHILE_CHECK', cond_node, body))
                work_stack.append(('LOOP_END',))
                scope_enter()
                work_stack.append(('SCOPE_EXIT',))
                for stmt in reversed(body):
                    work_stack.append(('STMT', stmt))

        # ── FOR_ITER ──────────────────────────────────────
        elif tag == 'FOR_ITER':
            _, item_name, iterable, index, body = frame

            if index < len(iterable):
                work_stack.append(('FOR_ITER', item_name, iterable, index + 1, body))
                work_stack.append(('LOOP_END',))
                scope_enter()
                scope_declare(item_name, iterable[index])
                work_stack.append(('SCOPE_EXIT',))
                for stmt in reversed(body):
                    work_stack.append(('STMT', stmt))

    return {'output': output, 'error': error}

