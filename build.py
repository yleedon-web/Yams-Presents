import os
import shutil
from pathlib import Path

ROOT = Path(__file__).parent


def get_apps_script_url():
    url = os.environ.get('APPS_SCRIPT_URL')
    if url:
        return url.strip()
    fallback = ROOT / 'scripts' / 'APPS_SCRIPT_URL.txt'
    if fallback.exists():
        return fallback.read_text().strip()
    raise ValueError(
        'APPS_SCRIPT_URL env var not set and scripts/APPS_SCRIPT_URL.txt not found'
    )


def build(src=None, dist=None):
    src = src or ROOT / "src"
    dist = dist or ROOT / "dist"
    if dist.is_dir():
        shutil.rmtree(dist)
    shutil.copytree(src, dist)
    script_js = dist / 'script.js'
    if script_js.exists():
        url = get_apps_script_url()
        script_js.write_text(script_js.read_text().replace('__APPS_SCRIPT_URL__', url))


if __name__ == "__main__":
    build()
