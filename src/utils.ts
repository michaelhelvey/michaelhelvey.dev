/**
 * Creates a URL friendly slug from a file path to a local blog post.
 *
 * @param path A file path such as ./src/contents/blog/rust_async_runtime.md
 * @returns A slug, such as "rust-async-runtime"
 */
export function getSlugFromFilePath(path: string) {
  const parts = path.split("/");
  const name = parts[parts.length - 1];
  return name.replaceAll("_", "-").replaceAll(".md", "");
}
