from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src"
files = list(root.rglob("*.ts")) + list(root.rglob("*.tsx"))
fixed_n = 0
em = "\u2014".encode("utf-8")  # —

for p in files:
    raw = p.read_bytes()
    try:
        raw.decode("utf-8")
        continue
    except UnicodeDecodeError:
        pass

    new = raw.replace(b"\xa1\xaa", em)
    try:
        text = new.decode("utf-8")
    except UnicodeDecodeError:
        text = new.decode("utf-8", errors="replace").replace("\ufffd", "")

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    p.write_text(text, encoding="utf-8", newline="\n")
    fixed_n += 1
    print("fixed", p.relative_to(root))

print("total", fixed_n)

bad = 0
for p in files:
    try:
        p.read_bytes().decode("utf-8")
    except UnicodeDecodeError as e:
        bad += 1
        print("still bad", p, e)

print("remaining bad", bad)
