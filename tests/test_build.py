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


def test_build_injects_apps_script_url(tmp_path, monkeypatch):
    src = tmp_path / "src"
    src.mkdir()
    (src / "script.js").write_text("const URL = '__APPS_SCRIPT_URL__';")
    monkeypatch.setenv("APPS_SCRIPT_URL", "https://test.example.com/exec")
    build(src=src, dist=tmp_path / "dist")
    assert (tmp_path / "dist" / "script.js").read_text() == \
        "const URL = 'https://test.example.com/exec';"


def test_build_injects_admin_password(tmp_path, monkeypatch):
    src = tmp_path / "src"
    src.mkdir()
    (src / "admin.js").write_text("const PW = '__ADMIN_PASSWORD__';")
    monkeypatch.setenv("APPS_SCRIPT_URL", "https://test.example.com/exec")
    monkeypatch.setenv("ADMIN_PASSWORD", "testpass")
    build(src=src, dist=tmp_path / "dist")
    assert (tmp_path / "dist" / "admin.js").read_text() == "const PW = 'testpass';"


def test_build_injects_both_placeholders(tmp_path, monkeypatch):
    src = tmp_path / "src"
    src.mkdir()
    (src / "admin.js").write_text(
        "const API='__APPS_SCRIPT_URL__'; const PW='__ADMIN_PASSWORD__';"
    )
    monkeypatch.setenv("APPS_SCRIPT_URL", "https://test.example.com/exec")
    monkeypatch.setenv("ADMIN_PASSWORD", "testpass")
    build(src=src, dist=tmp_path / "dist")
    assert (tmp_path / "dist" / "admin.js").read_text() == \
        "const API='https://test.example.com/exec'; const PW='testpass';"
