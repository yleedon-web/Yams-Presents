from pathlib import Path

from build import build


def test_build_copies_src_to_dist(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "index.html").write_text("<h1>Hello</h1>")

    dist = tmp_path / "dist"
    build(src=src, dist=dist)

    assert (dist / "index.html").read_text() == "<h1>Hello</h1>"


def test_build_recreates_dist_on_rerun(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "index.html").write_text("<h1>New</h1>")

    dist = tmp_path / "dist"
    dist.mkdir()
    (dist / "stale.html").write_text("old")

    build(src=src, dist=dist)

    assert not (dist / "stale.html").exists()
    assert (dist / "index.html").read_text() == "<h1>New</h1>"
