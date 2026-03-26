# pipeline.py — Cordex Pipeline

from .parser import parse
from .semantic_analyzer import analyze
from .interpreter import execute
# Correct
from compiler.roast import get_roast

from .roast import get_roast

def compile_and_run(source, roast_mode=False):

    try:
        ast = parse(source)
    except Exception as e:
        error_msg = str(e)
        return {
            'output': [],
            'errors': [error_msg],
            'runtime_error': None,
            'stage': 'lexer/parser',
            'roast': get_roast(error_msg, 'lexer/parser', source) if roast_mode else None
        }

    sem_errors = analyze(ast)
    if sem_errors:
        error_msg = sem_errors[0]
        return {
            'output': [],
            'errors': sem_errors,
            'runtime_error': None,
            'stage': 'semantic',
            'roast': get_roast(error_msg, 'semantic', source) if roast_mode else None
        }

    result = execute(ast)
    return {
        'output': result['output'],
        'errors': [],
        'runtime_error': result['error'],
        'stage': 'runtime',
        'roast': get_roast(result['error'], 'runtime', source) if roast_mode and result['error'] else None
    }