from cordex.compiler.roast import get_roast

result = get_roast(
    error_message="Undefined variable 'x'",
    stage="semantic_analyzer",
    source_code="let y = 10;\nprint(x);"
)
print(result)