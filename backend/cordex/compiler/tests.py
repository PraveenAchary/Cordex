from cordex.compiler.pipeline import compile_and_run

result = compile_and_run("print(z)", roast_mode=True)
print(result['roast'])