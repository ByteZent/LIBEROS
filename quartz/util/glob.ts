import path from "path"
import { FilePath } from "./path"
import { globby } from "globby"

export function toPosixPath(fp: string): string {
  return fp.split(path.sep).join("/")
}

export async function glob(
  pattern: string,
  cwd: string,
  ignorePatterns: string[],
): Promise<FilePath[]> {
  const fps = (
    await globby(pattern, {
      cwd,
      ignore: ignorePatterns,
      gitignore: true,
    })
  ).map(toPosixPath)

  // LIBEROS: _private is gitignored, so globby skips it. For the local private
  // preview (LIBEROS_PRIVATE=1, make serve-private) pick those files up explicitly.
  if (process.env.LIBEROS_PRIVATE === "1") {
    const priv = (await globby(pattern, { cwd, ignore: ignorePatterns, gitignore: false }))
      .map(toPosixPath)
      .filter((fp) => fp.split("/").includes("_private"))
    return [...new Set([...fps, ...priv])] as FilePath[]
  }

  return fps as FilePath[]
}
