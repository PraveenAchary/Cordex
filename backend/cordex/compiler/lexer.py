# lexer.py

# ── Token Types ──────────────────────────────────────────
TT_INT       = 'INT'
TT_FLOAT     = 'FLOAT'
TT_STRING    = 'STRING'
TT_IDENT     = 'IDENT'
TT_KEYWORD   = 'KEYWORD'
TT_PLUS      = 'PLUS'
TT_MINUS     = 'MINUS'
TT_MUL       = 'MUL'
TT_DIV       = 'DIV'
TT_ASSIGN    = 'ASSIGN'
TT_EQ        = 'EQ'
TT_NEQ       = 'NEQ'
TT_LT        = 'LT'
TT_GT        = 'GT'
TT_LTE       = 'LTE'
TT_GTE       = 'GTE'
TT_LPAREN    = 'LPAREN'
TT_RPAREN    = 'RPAREN'
TT_LBRACE    = 'LBRACE'
TT_RBRACE    = 'RBRACE'
TT_LBRACKET  = 'LBRACKET'
TT_RBRACKET  = 'RBRACKET'
TT_COMMA     = 'COMMA'
TT_SEMICOLON = 'SEMICOLON'
TT_EOF       = 'EOF'

# ── Keywords ─────────────────────────────────────────────
# All keywords Cordex recognizes (old + new Desi-Indian style)

KEYWORDS = {
    # ── Original Standard Keywords ────────────────────────
    'let', 'func',
    'if', 'else', 'while', 'for', 'in',
    'print',
    'true', 'false', 'null',
    'break', 'continue', 'return',

    # ── Original Cardiology-Themed Keywords ───────────────
    'diagnose', 'rediagnose', 'bypass', 'pulse',
    'monitor', 'scan', 'beating', 'flatline',

    # ── New Desi-Indian Style Keywords ────────────────────
    'rakho',        # "keep/store"      → alias for let
    'kaam',         # "work/function"   → alias for func
    'agar',         # "if"              → alias for if
    'warna',        # "otherwise"       → alias for else
    'ya_phir',      # "or else if"      → alias for else if
    'jab_tak',      # "as long as"      → alias for while
    'baar_baar',    # "again and again" → alias for for
    'bas',          # "enough/stop"     → alias for break
    'aage_badh',    # "move forward"    → alias for continue
    'wapas',        # "return/back"     → alias for return
    'bol',          # "say/speak"       → alias for print
    'sunao',        # "tell me"         → alternate print
    'sach',         # "truth"           → alias for true
    'jhooth',       # "lie"             → alias for false
    'kuch_nahi',    # "nothing"         → alias for null
}

# ── Desi Keyword Alias Map ────────────────────────────────
# Maps new Desi keywords → their standard equivalent
# Used by the tokenizer to normalize keywords before parsing
DESI_ALIAS = {
    'rakho'     : 'let',
    'kaam'      : 'func',
    'agar'      : 'if',
    'warna'     : 'else',
    'ya_phir'   : 'else',   # treated as else; parser handles else+if
    'jab_tak'   : 'while',
    'baar_baar' : 'for',
    'bas'       : 'break',
    'aage_badh' : 'continue',
    'wapas'     : 'return',
    'bol'       : 'print',
    'sunao'     : 'print',
    'sach'      : 'true',
    'jhooth'    : 'false',
    'kuch_nahi' : 'null',
}

def make_token(type_, value=None):
    return {'type': type_, 'value': value}


def tokenize(source):
    tokens = []
    pos    = 0
    line   = 1

    def current():
        return source[pos] if pos < len(source) else None

    def peek():
        return source[pos + 1] if pos + 1 < len(source) else None

    def advance():
        nonlocal pos, line
        ch = source[pos]
        pos += 1
        if ch == '\n':
            line += 1
        return ch

    while current() is not None:
        ch = current()

        # skip whitespace
        if ch in ' \t\r\n':
            advance()

        # skip comments  # like this
        elif ch == '#':
            while current() and current() != '\n':
                advance()

        # number: 42 or 3.14
        elif ch.isdigit():
            num = ''
            while current() and current().isdigit():
                num += advance()
            if current() == '.' and peek() and peek().isdigit():
                num += advance()
                while current() and current().isdigit():
                    num += advance()
                tokens.append(make_token(TT_FLOAT, float(num)))
            else:
                tokens.append(make_token(TT_INT, int(num)))

        # string: "hello"
        elif ch == '"':
            advance()
            s = ''
            while current() and current() != '"':
                s += advance()
            if current() is None:
                raise Exception(f'[Line {line}] Unterminated string')
            advance()
            tokens.append(make_token(TT_STRING, s))

        # identifier or keyword
        elif ch.isalpha() or ch == '_':
            word = ''
            while current() and (current().isalnum() or current() == '_'):
                word += advance()
            if word in KEYWORDS:
                # Normalize Desi alias → standard keyword for parser
                normalized = DESI_ALIAS.get(word, word)
                tokens.append(make_token(TT_KEYWORD, normalized))
            else:
                tokens.append(make_token(TT_IDENT, word))

        # = or ==
        elif ch == '=':
            advance()
            if current() == '=':
                advance()
                tokens.append(make_token(TT_EQ, '=='))
            else:
                tokens.append(make_token(TT_ASSIGN, '='))

        # !=
        elif ch == '!':
            advance()
            if current() == '=':
                advance()
                tokens.append(make_token(TT_NEQ, '!='))
            else:
                raise Exception(f'[Line {line}] Unexpected character: !')

        # < or <=
        elif ch == '<':
            advance()
            if current() == '=':
                advance()
                tokens.append(make_token(TT_LTE, '<='))
            else:
                tokens.append(make_token(TT_LT, '<'))

        # > or >=
        elif ch == '>':
            advance()
            if current() == '=':
                advance()
                tokens.append(make_token(TT_GTE, '>='))
            else:
                tokens.append(make_token(TT_GT, '>'))

        elif ch == '+': advance(); tokens.append(make_token(TT_PLUS,  '+'))
        elif ch == '-': advance(); tokens.append(make_token(TT_MINUS, '-'))
        elif ch == '*': advance(); tokens.append(make_token(TT_MUL,   '*'))
        elif ch == '/': advance(); tokens.append(make_token(TT_DIV,   '/'))
        elif ch == '(': advance(); tokens.append(make_token(TT_LPAREN))
        elif ch == ')': advance(); tokens.append(make_token(TT_RPAREN))
        elif ch == '{': advance(); tokens.append(make_token(TT_LBRACE))
        elif ch == '}': advance(); tokens.append(make_token(TT_RBRACE))
        elif ch == '[': advance(); tokens.append(make_token(TT_LBRACKET))
        elif ch == ']': advance(); tokens.append(make_token(TT_RBRACKET))
        elif ch == ',': advance(); tokens.append(make_token(TT_COMMA))
        elif ch == ';': advance(); tokens.append(make_token(TT_SEMICOLON))

        else:
            raise Exception(f'[Line {line}] Unknown character: {ch!r}')

    tokens.append(make_token(TT_EOF))
    return tokens
