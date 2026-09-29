import { QuartzTransformerPlugin } from "../types"
import { slugTag } from "../../util/path"

// Derives a `course/<code>` tag from each code in a note's `courses:` frontmatter.
// Quartz then emits /tags/course/<code>, a page listing every published note for that course.
// Give that page a readable title in content/tags/course/<code>.md so search finds it by course
// name; the NoteStatus COURSE badge reads its label from the same file.
export const COURSE_TAG_PREFIX = "course/"

export const CourseTags: QuartzTransformerPlugin = () => ({
  name: "CourseTags",
  markdownPlugins() {
    return [
      () => (_tree, file) => {
        const fm = file.data.frontmatter
        if (!fm) return
        const courses = (Array.isArray(fm.courses) ? fm.courses : [fm.courses]).filter(
          (c): c is string => typeof c === "string" && c.trim() !== "",
        )
        if (courses.length === 0) return
        const tags = new Set(fm.tags ?? [])
        for (const code of courses) tags.add(slugTag(COURSE_TAG_PREFIX + code.trim()))
        fm.tags = [...tags]
      },
    ]
  },
})
