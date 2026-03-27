# parser.py
from .lexer import tokenize

# ── Operator token types (used in Shunting Yard) ─────────
OP_TYPES = {'PLUS', 'MINUS', 'MUL', 'DIV', 'LT', 'GT', 'EQ', 'NEQ', 'LTE', 'GTE'}

# ── Precedence Table ──────────────────────────────────────
precedence = {
    '+':  1, '-':  1,
    '*':  2, '/':  2,
    '>':  0, '<':  0,
    '==': 0, '!=': 0,
    '>=': 0, '<=': 0,
}

# ── Parser State ──────────────────────────────────────────
tokens = []
i      = 0

def current():
    return tokens[i] if i < len(tokens) else None

def advance():
    global i
    i += 1

# ── Array Literal Parser ──────────────────────────────────
def parse_array():
    """Parse [expr, expr, ...] and return an ArrayLiteral node."""
    advance()   # skip '['
    elements = []

    while current() and current()['type'] != 'RBRACKET':
        # skip commas between elements
        if current()['type'] == 'COMMA':
            advance()
            continue
        elem = parse_expression()
        if elem is not None:
            elements.append(elem)

    if current() and current()['type'] == 'RBRACKET':
        advance()   # skip ']'

    return {'type': 'ArrayLiteral', 'elements': elements}

# ── Expression Parser (Shunting Yard) ─────────────────────
def parse_expression():
    operand_stack  = []
    operator_stack = []

    STOP_TYPES = {'RPAREN', 'LBRACE', 'RBRACE', 'SEMICOLON', 'COMMA', 'RBRACKET', 'EOF'}

    while current() and current()['type'] not in STOP_TYPES:
        token = current()

        # array literal
        if token['type'] == 'LBRACKET':
            operand_stack.append(parse_array())

        # literals and identifiers → push as operand
        elif token['type'] in ('INT', 'FLOAT', 'IDENT'):
            operand_stack.append(token['value'])
            advance()

        # string literals wrapped so interpreter can distinguish from IDENT
        elif token['type'] == 'STRING':
            operand_stack.append({'type': 'StringLiteral', 'value': token['value']})
            advance()

        # boolean / null literals
        elif token['type'] == 'KEYWORD' and token['value'] in ('true', 'false', 'null'):
            operand_stack.append(token['value'])
            advance()

        # operators → Shunting Yard
        elif token['type'] in OP_TYPES:
            op = token['value']
            while (operator_stack and
                   precedence.get(operator_stack[-1], -1) >= precedence.get(op, -1)):
                right = operand_stack.pop()
                left  = operand_stack.pop()
                operand_stack.append({
                    'type': 'BinaryExpr',
                    'left': left,
                    'op':   operator_stack.pop(),
                    'right': right
                })
            operator_stack.append(op)
            advance()

        else:
            break

    # drain remaining operators
    while operator_stack:
        right = operand_stack.pop()
        left  = operand_stack.pop()
        operand_stack.append({
            'type':  'BinaryExpr',
            'left':  left,
            'op':    operator_stack.pop(),
            'right': right
        })

    return operand_stack[0] if operand_stack else None

# ── Body Parser (statements inside { }) ───────────────────
def parse_body():
    body = []
    while current() and current()['type'] not in ('RBRACE', 'EOF'):
        stmt = parse_statement()
        if stmt:
            body.append(stmt)
    return body

# ── Statement Parser ──────────────────────────────────────
def parse_statement():
    token = current()

    if token is None or token['type'] == 'EOF':
        return None

    # skip lone semicolons
    if token['type'] == 'SEMICOLON':
        advance()
        return None

    # ── let x = <expr> ──
    if token['type'] == 'KEYWORD' and token['value'] == 'let':
        
        advance()                           # skip 'let'
        if current() is None or current()['type'] != 'IDENT':
            raise Exception(f"Expected variable name after 'let', got '{current()['value'] if current() else 'EOF'}'")

        name = current()['value']           # variable name
        advance()                           # skip name
        advance()                           # skip '='
        value = parse_expression()          # right-hand side
        return {'type': 'LetStatement', 'name': name, 'value': value}

    # ── if / elif / else ──
    elif token['type'] == 'KEYWORD' and token['value'] == 'if':
        advance()                           # skip 'if'
        advance()                           # skip '('
        condition = parse_expression()
        advance()                           # skip ')'
        advance()                           # skip '{'
        body = parse_body()
        advance()                           # skip '}'

        elif_clauses = []
        else_body    = None

        while (current() and current()['type'] == 'KEYWORD' and current()['value'] in ('else', 'elif')):
    
                tok_val = current()['value']
                advance()  # skip 'else' or 'elif'
            
                # 'elif' (ya_phir) is already a self-contained else-if token
                # 'else' followed by 'if'/'agar' is also an else-if
                is_elif = (tok_val == 'elif') or (
                    current() and current()['type'] == 'KEYWORD' and
                    current()['value'] in ('if', 'agar')
                )
            
                if is_elif:
                    if tok_val == 'else':
                        advance()   # skip the 'if'/'agar' that follows
                    advance()       # skip '('
                    elif_cond = parse_expression()
                    advance()       # skip ')'
                    advance()       # skip '{'
                    elif_body = parse_body()
                    advance()       # skip '}'
                    elif_clauses.append({'condition': elif_cond, 'body': elif_body})
                else:
                    advance()       # skip '{'
                    else_body = parse_body()
                    advance()       # skip '}'
                    break

        return {
            'type':         'IfStatement',
            'condition':    condition,
            'body':         body,
            'elif_clauses': elif_clauses,
            'else_body':    else_body
        }

    # ── while (<cond>) { } ──
    elif token['type'] == 'KEYWORD' and token['value'] == 'while':
        advance()                           # skip 'while'
        advance()                           # skip '('
        condition = parse_expression()
        advance()                           # skip ')'
        advance()                           # skip '{'
        body = parse_body()
        advance()                           # skip '}'
        return {'type': 'WhileStatement', 'condition': condition, 'body': body}

    # ── for item in iterable { } ──
    # Supports both: "for item in arr {" and "for (item in arr) {"
    elif token['type'] == 'KEYWORD' and token['value'] == 'for':
        advance()                           # skip 'for'

        has_paren = current() and current()['type'] == 'LPAREN'
        if has_paren:
            advance()                       # skip '('

        item = current()['value']
        advance()                           # skip item name
        advance()                           # skip 'in'
        iterable = current()['value']
        advance()                           # skip iterable name

        if has_paren:
            advance()                       # skip ')'

        advance()                           # skip '{'
        body = parse_body()
        advance()                           # skip '}'
        return {'type': 'ForStatement', 'item': item, 'iterable': iterable, 'body': body}

    # ── print(<value>) ──
    elif token['type'] == 'KEYWORD' and token['value'] == 'print':
        advance()                           # skip 'print'
        advance()                           # skip '('
        value = parse_expression()
        advance()                           # skip ')'
        return {'type': 'PrintStatement', 'value': value}

    # ── break ──
    elif token['type'] == 'KEYWORD' and token['value'] == 'break':
        advance()
        return {'type': 'BreakStatement'}

    # ── continue ──
    elif token['type'] == 'KEYWORD' and token['value'] == 'continue':
        advance()
        return {'type': 'ContinueStatement'}

    elif token['type'] == 'IDENT':
        name = token['value']
        advance()
        op = current()['type'] if current() else None

        if op=='PLUSPLUS':
            advance();
            return {
                'type':"LetStatement",
                "name":name,
                "value":{"type":"BinaryExpr","left":name,'op':'+',"right":1}
            }
        elif op=='MINUSMINUS':
            advance()
            return {
                "type":"LetStatement",
                "name":name,
                "value":{"type":"BinaryExpr","left":name,"op":'-',"right":1}
            }
    else:
        val = token.get('value', token.get('type', '?'))
        raise Exception(f"Unexpected token '{val}' at line {token.get('line', '?')}")

# ── Program Parser ────────────────────────────────────────
def parse_program():
    program = []
    while current() and current()['type'] != 'EOF':
        stmt = parse_statement()
        if stmt:
            program.append(stmt)
    return {'type': 'Program', 'body': program}

# ── Public entry point ────────────────────────────────────
def parse(source):
    """Tokenize source and return the AST."""
    global tokens, i
    tokens = tokenize(source)
    i      = 0
    return parse_program()
