import os
import subprocess
import sys
import tempfile


def execute_python(code: str) -> dict:
    """Safely execute Python code in a subprocess with timeout."""
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8",
        ) as f:
            f.write(code)
            tmp_path = f.name

        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=10,
        )

        return {
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None,
            "success": result.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": "Execution timed out after 10 seconds.",
            "success": False,
        }
    except Exception as e:
        return {
            "output": "",
            "error": str(e),
            "success": False,
        }
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
