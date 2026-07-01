import os
import shutil
from pathlib import Path

ROOT = Path(__file__).parent


def get_apps_script_url():
    url = os.environ.get('APPS_SCRIPT_URL')
    if url is not None:
        url = url.strip()
        if not url:
            raise ValueError('APPS_SCRIPT_URL is set but empty — add the secret in GitHub repo settings')
        return url
    fallback = ROOT / 'scripts' / 'APPS_SCRIPT_URL.txt'
    if fallback.exists():
        return fallback.read_text().strip()
    raise ValueError(
        'APPS_SCRIPT_URL env var not set and scripts/APPS_SCRIPT_URL.txt not found'
    )


def get_admin_password():
    pw = os.environ.get('ADMIN_PASSWORD')
    if pw is not None:
        pw = pw.strip()
        if not pw:
            raise ValueError('ADMIN_PASSWORD is set but empty — add the secret in GitHub repo settings')
        return pw
    raise ValueError('ADMIN_PASSWORD env var not set')


def _inject_placeholders(dist: Path):
    placeholders = {
        '__APPS_SCRIPT_URL__': None,
        '__ADMIN_PASSWORD__': None,
    }
    for path in dist.rglob('*'):
        if path.suffix not in ('.html', '.js'):
            continue
        content = path.read_text()
        if not any(p in content for p in placeholders):
            continue
        if '__APPS_SCRIPT_URL__' in content:
            if placeholders['__APPS_SCRIPT_URL__'] is None:
                placeholders['__APPS_SCRIPT_URL__'] = get_apps_script_url()
            content = content.replace('__APPS_SCRIPT_URL__', placeholders['__APPS_SCRIPT_URL__'])
        if '__ADMIN_PASSWORD__' in content:
            if placeholders['__ADMIN_PASSWORD__'] is None:
                placeholders['__ADMIN_PASSWORD__'] = get_admin_password()
            content = content.replace('__ADMIN_PASSWORD__', placeholders['__ADMIN_PASSWORD__'])
        path.write_text(content)


def build(src=None, dist=None):
    if src is None:
        src = ROOT / "src"
    if dist is None:
        dist = ROOT / "dist"
    if dist.is_dir():
        shutil.rmtree(dist)
    shutil.copytree(src, dist)
    _inject_placeholders(dist)


if __name__ == "__main__":
    build()
