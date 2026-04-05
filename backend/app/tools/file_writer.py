import os
import re

_OUTPUT_DIR = os.path.join(os.getcwd(), "outputs")


def _sanitize_filename(filename: str) -> str:
    """Remove path traversal and dangerous characters."""
    # Strip any directory components
    filename = os.path.basename(filename)
    # Allow only alphanumeric, dash, underscore, dot
    filename = re.sub(r"[^\w\-.]", "_", filename)
    # Collapse multiple dots (no hidden files like ..hidden)
    filename = re.sub(r"\.{2,}", ".", filename)
    # Ensure not empty
    if not filename or filename.startswith("."):
        filename = "output.txt"
    return filename


def write_output(filename: str, content: str) -> dict:
    """Write content to the outputs/ directory."""
    safe_name = _sanitize_filename(filename)
    output_dir = _OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)

    path = os.path.join(output_dir, safe_name)

    # Final safety check — ensure resolved path is inside output_dir
    resolved = os.path.realpath(path)
    resolved_dir = os.path.realpath(output_dir)
    if not resolved.startswith(resolved_dir + os.sep) and resolved != resolved_dir:
        raise ValueError(f"Path traversal detected: {filename!r}")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    return {"path": path, "size": len(content.encode("utf-8"))}
