import { changelog } from "collections/server"
import { loader } from "fumadocs-core/source"

export const changelogSource = loader({
  baseUrl: "/changelog",
  source: changelog.toFumadocsSource(),
})
