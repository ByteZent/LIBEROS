import test from "node:test"
import assert from "node:assert/strict"
import { FileSystem, Store, expand, movePatch, parseIcs } from "../src/core"
import * as inline from "../src/core/inline"
import { patchFrontmatter, split, toItem } from "../src/core/notes"

class MemoryFs implements FileSystem {
  files = new Map<string, string>()
  trashed: string[] = []
  private clock = 0
  private mtimes = new Map<string, number>()
  async list() {
    return [...this.files.keys()]
      .filter((path) => path.endsWith(".md"))
      .map((path) => ({ path, mtime: this.mtimes.get(path)! }))
  }
  async read(path: string) {
    return this.files.get(path) ?? null
  }
  async write(path: string, text: string) {
    this.files.set(path, text)
    this.mtimes.set(path, ++this.clock)
  }
  async trash(path: string) {
    this.files.delete(path)
    this.trashed.push(path)
  }
}

const ICS = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:a@x
SUMMARY:Lecture\\, part 1
DESCRIPTION:Bring notes\\nKategorie: Vorlesung
DTSTART;TZID=Europe/Zurich:20260928T101500
DTEND;TZID=Europe/Zurich:20260928T120000
RRULE:FREQ=WEEKLY;COUNT=4;BYDAY=MO
EXDATE;TZID=Europe/Zurich:20261005T101500
END:VEVENT
BEGIN:VEVENT
UID:a@x
RECURRENCE-ID;TZID=Europe/Zurich:20261012T101500
SUMMARY:Lecture
DTSTART;TZID=Europe/Zurich:20261013T140000
DTEND;TZID=Europe/Zurich:20261013T150000
END:VEVENT
BEGIN:VEVENT
UID:b@x
SUMMARY:Holiday
DTSTART;VALUE=DATE:20261001
DTEND;VALUE=DATE:20261003
END:VEVENT
END:VCALENDAR`

const feed = { name: "ETH", url: "", categoryField: "Kategorie" }
process.env.TZ = "Europe/Zurich"

test("ics: series, exdate, moved occurrence, all-day", () => {
  const [lecture, holiday] = parseIcs(ICS, feed)
  assert.equal(lecture.title, "Lecture, part 1")
  assert.equal(lecture.category, "Vorlesung")
  assert.equal(lecture.start, "2026-09-28T10:15")
  const starts = expand(lecture, "2026-09-01", "2026-12-01")
    .map((o) => o.start)
    .sort()
  assert.deepEqual(starts, ["2026-09-28T10:15", "2026-10-13T14:00", "2026-10-19T10:15"])
  assert.equal(holiday.start, "2026-10-01")
  assert.equal(holiday.end, "2026-10-02")
  assert.equal(expand(holiday, "2026-10-02", "2026-10-03").length, 1)
  assert.equal(expand(holiday, "2026-10-03", "2026-10-04").length, 0)
})

test("recurrence keeps the wall clock across the end of summer time", () => {
  const [lecture] = parseIcs(ICS.replace("COUNT=4", "COUNT=8"), feed)
  const late = expand(lecture, "2026-10-26", "2026-11-03")
  assert.deepEqual(
    late.map((o) => o.start),
    ["2026-10-26T10:15", "2026-11-02T10:15"],
  )
  assert.equal(late[0].end, "2026-10-26T12:00")
})

test("moving a series shifts its weekday and its exceptions", () => {
  const [lecture] = parseIcs(ICS, feed)
  const patch = movePatch(lecture, "2026-10-20T08:00", "2026-10-20T09:00", {
    key: "2026-10-19T10:15",
    scope: "all",
  })
  assert.equal(patch.start, "2026-09-29T08:00")
  assert.equal(patch.end, "2026-09-29T09:00")
  assert.equal(patch.rrule, "FREQ=WEEKLY;COUNT=4;BYDAY=TU")
  assert.deepEqual(patch.exdates, ["2026-10-06T08:00"])
  const one = movePatch(lecture, "2026-10-20T08:00", undefined, {
    key: "2026-10-19T10:15",
    scope: "one",
  })
  assert.deepEqual(one.overrides!["2026-10-19T10:15"], {
    start: "2026-10-20T08:00",
    end: undefined,
  })
})

test("inline tasks: read, rewrite, keep the user's text", () => {
  const line =
    "  - [ ] Read [[Perception|chapter 3]] #course/MilPsy ⏫ 🔁 every week ⏳ 2026-10-12 14:00 ⏱ 45m 📅 2026-10-20"
  const [task] = inline.scan(`---\ntitle: x\n---\n\`\`\`\n- [ ] in code\n\`\`\`\n${line}\n`, "a.md")
  assert.equal(task.title, "Read chapter 3")
  assert.deepEqual(task.tags, ["course/MilPsy"])
  assert.equal(task.priority, "high")
  assert.equal(task.start, "2026-10-12T14:00")
  assert.equal(task.end, "2026-10-12T14:45")
  assert.equal(task.due, "2026-10-20")
  assert.equal(task.line, 6)
  assert.match(task.rrule!, /FREQ=WEEKLY/)
  assert.equal(inline.formatLine(inline.parseLine(line)!), line)
  assert.equal(
    inline.patchLine("- [ ] Plain task", { start: "2026-10-12" }),
    "- [ ] Plain task ⏳ 2026-10-12",
  )
  assert.equal(
    inline.patchLine("- [ ] Plain task ⏳ 2026-10-12", { status: "done" }, "2026-10-13"),
    "- [x] Plain task ⏳ 2026-10-12 ✅ 2026-10-13",
  )
})

test("frontmatter is patched in place", () => {
  const text = '---\ntitle: "A: b"\n# keep me\ntype: task\ntags:\n  - x\n---\nBody\n'
  const out = patchFrontmatter(text, { start: "2026-10-12T14:00", due: "2026-10-20", tags: [] })
  assert.match(out, /# keep me/)
  assert.match(out, /start: 2026-10-12T14:00\n/)
  assert.match(out, /due: 2026-10-20\n/)
  assert.doesNotMatch(out, /tags/)
  assert.ok(out.endsWith("---\nBody\n"))
  assert.equal(toItem(split(out).data, "t.md")!.start, "2026-10-12T14:00")
})

test("store: create, move, complete, delete; deadlines; feed overrides", async () => {
  const fs = new MemoryFs()
  const store = new Store(fs, "_private/Planner")
  await fs.write("_private/Planner/planner.json", JSON.stringify({ feeds: [feed] }))
  await fs.write("_private/Planner/feeds/ETH.ics", ICS)
  await fs.write(
    "09/Map.md",
    "---\ntype: moc\ncourse: MilPsy-HS26\n---\n## Assessment\n\n| What | When | Form |\n|---|---|---|\n| Session exam | August 2027 | Written |\n| Practice example | 11.10.2026 | Hand in |\n\n## Prep\n- [ ] Pick a case\n",
  )
  let snap = await store.snapshot()
  const deadline = snap.items.find((i) => i.kind === "deadline")!
  assert.equal(deadline.start, "2026-10-11")
  assert.equal(deadline.course, "MilPsy-HS26")
  assert.equal(snap.items.filter((i) => i.kind === "deadline").length, 1)
  await assert.rejects(store.apply({ op: "delete", id: deadline.id }))

  const id = (await store.apply({
    op: "create",
    item: { kind: "task", title: "Outline: paper?", due: "2026-10-20", tags: ["planner"] },
  }))!
  assert.equal(id, "note:_private/Planner/Tasks/Outline paper.md")
  await store.apply({ op: "move", id, start: "2026-10-15T09:00", end: "2026-10-15T10:00" })
  await store.apply({ op: "done", id, done: true })
  snap = await store.snapshot()
  const task = snap.items.find((i) => i.id === id)!
  assert.deepEqual(
    [task.start, task.end, task.due, task.status],
    ["2026-10-15T09:00", "2026-10-15T10:00", "2026-10-20", "done"],
  )

  const todo = snap.items.find((i) => i.source === "inline")!
  await fs.write("09/Map.md", "New first line\n" + fs.files.get("09/Map.md"))
  await store.apply({ op: "move", id: todo.id, raw: todo.raw, start: "2026-10-09" })
  assert.match(fs.files.get("09/Map.md")!, /- \[ \] Pick a case ⏳ 2026-10-09\n/)

  const lecture = snap.items.find((i) => i.uid === "a@x")!
  await store.apply({
    op: "delete",
    id: lecture.id,
    occurrence: { key: "2026-09-28T10:15", scope: "one" },
  })
  await store.apply({ op: "update", id: lecture.id, patch: { category: "Seminar" } })
  snap = await store.snapshot()
  const changed = snap.items.find((i) => i.uid === "a@x")!
  assert.equal(changed.category, "Seminar")
  assert.equal(expand(changed, "2026-09-01", "2026-12-01").length, 2)
  assert.equal(fs.files.get("_private/Planner/feeds/ETH.ics"), ICS)
  assert.ok(snap.categories.some((c) => c.name === "Seminar"))

  await store.apply({ op: "delete", id })
  assert.deepEqual(fs.trashed, ["_private/Planner/Tasks/Outline paper.md"])
})

test("a recurring inline task leaves its successor above the finished line", async () => {
  const fs = new MemoryFs()
  const store = new Store(fs, "P")
  await fs.write("n.md", "- [ ] Review cards 🔁 every week 📅 2026-10-05\n")
  const [task] = (await store.snapshot()).items
  await store.apply({ op: "done", id: task.id, raw: task.raw, done: true })
  const [again, finished] = fs.files.get("n.md")!.split("\n")
  assert.equal(again, "- [ ] Review cards 🔁 every week 📅 2026-10-12")
  assert.match(finished, /^- \[x\] Review cards 🔁 every week 📅 2026-10-05 ✅ \d{4}-\d{2}-\d{2}$/)
})

test("feed rules name the category of events without a category line", () => {
  const plain = ICS.replace("\\nKategorie: Vorlesung", "")
  const rules = [{ match: "^lecture", category: "Vorlesung" }]
  assert.equal(parseIcs(plain, { ...feed, rules })[0].category, "Vorlesung")
  assert.equal(parseIcs(plain, feed)[0].category, "ETH")
  assert.equal(
    parseIcs(ICS, { ...feed, rules: [{ match: ".", category: "Other" }] })[0].category,
    "Vorlesung",
  )
})
