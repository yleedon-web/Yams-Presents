import shutil
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from build import build


def test_build_copies_src_to_dist(tmp_path, monkeypatch):
    src = tmp_path / "src"
    src.mkdir()
    (src / "index.html").write_text("<h1>Hello</h1>")

    monkeypatch.chdir(tmp_path)
    build()

    assert (tmp_path / "dist" / "index.html").read_text() == "<h1>Hello</h1>"


def test_build_recreates_dist_on_rerun(tmp_path, monkeypatch):
    src = tmp_path / "src"
    src.mkdir()
    (src / "index.html").write_text("<h1>New</h1>")

    dist = tmp_path / "dist"
    dist.mkdir()
    (dist / "stale.html").write_text("old")

    monkeypatch.chdir(tmp_path)
    build()

    assert not (dist / "stale.html").exists()
    assert (dist / "index.html").read_text() == "<h1>New</h1>"
