import shutil
from pathlib import Path


def build():
    src = Path("src")
    dist = Path("dist")
    if dist.exists():
        shutil.rmtree(dist)
    shutil.copytree(src, dist)


if __name__ == "__main__":
    build()
