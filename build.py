import shutil
from pathlib import Path

ROOT = Path(__file__).parent


def build(src: Path = None, dist: Path = None):
    if src is None:
        src = ROOT / "src"
    if dist is None:
        dist = ROOT / "dist"
    if dist.is_dir():
        shutil.rmtree(dist)
    shutil.copytree(src, dist)


if __name__ == "__main__":
    build()
