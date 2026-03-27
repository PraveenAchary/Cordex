import multiprocessing
import queue


def _worker(code, roast_mode, result_queue):
    try:
        from compiler.pipeline import compile_and_run
        result = compile_and_run(code, roast_mode=roast_mode)
        result_queue.put(result)
    except Exception as e:
        result_queue.put({
            "output": "",
            "errors": [str(e)],
            "stage": "runtime",
            "roast": None
        })


def run_with_timeout(code, roast_mode=False, timeout=30):
    result_queue = multiprocessing.Queue()

    process = multiprocessing.Process(
        target=_worker,
        args=(code, roast_mode, result_queue)
    )

    process.start()
    process.join(timeout)  # wait max 30 seconds

    if process.is_alive():
        process.kill()
        process.join()
        return {
            "output": "",
            "errors": [f"Execution timed out after {timeout} seconds (possible infinite loop)"],
            "stage": "runtime",
            "roast": None
        }

    try:
        return result_queue.get_nowait()
    except queue.Empty:
        return {
            "output": "",
            "errors": ["Execution failed with no output"],
            "stage": "runtime",
            "roast": None
        }
