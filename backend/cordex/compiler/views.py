from rest_framework.decorators import api_view
from rest_framework.response import Response

from .executor import run_with_timeout


@api_view(['POST'])
def compile_code(request):
    code = request.data.get("source", "")
    roast_mode = request.data.get("roast_mode", False)

    if not code.strip():
        return Response({
            "output": "",
            "error": ["no code provided"],
            "has_error": True,
            "stage": None,
            "roast": None
        })

    result = run_with_timeout(code, roast_mode=roast_mode, timeout=15)

    return Response({
        "output": result.get("output", ""),
        "error": result.get("errors", []),
        "has_error": bool(result.get("errors")),
        "stage": result.get("stage", None),
        "roast": result.get("roast", None)
    })


@api_view(['POST'])
def validate_code(request):
    code = request.data.get('source', '')

    if not code.strip():
        return Response({"output": "", "message": "No code provided", "valid": False})

    result = run_with_timeout(code, timeout=15)

    if result.get("errors"):
        return Response({
            "valid": False,
            "message": result["errors"][0],
            "stage": result.get("stage")
        })
    return Response({"valid": True, "message": "Syntax Looks Fine"})

