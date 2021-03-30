import sanityClient from "@sanity/client"
import blocksToHtml from "@sanity/block-content-to-html"
import imageUrlBuilder from "@sanity/image-url"
import getVideoId from "get-video-id"
import has from "lodash/has"
import get from "lodash/get"

// GLOBAL
import { SANITY_PROJECT_ID } from "./global.js"

const tracer = x => {
  console.dir(x)
  return x
}

export const client = sanityClient({
  projectId: SANITY_PROJECT_ID,
  dataset: "production",
  token: "", // or leave blank to be anonymous user
  useCdn: false, // `false` if you want to ensure fresh data
})

const h = blocksToHtml.h

const prepareTextElements = props => {
  let textElements = []
  if (has(props, "node.caption.content"))
    textElements.push(
      h(
        "figcaption",
        { className: "caption" },
        toPlainText(props.node.caption.content)
      )
    )
  if (has(props, "node.attribution"))
    textElements.push(
      h("figcaption", { className: "credits" }, props.node.attribution)
    )
  return textElements
}

export const renderBlockText = text =>
  blocksToHtml({
    blocks: text,
    serializers: serializers,
    projectId: SANITY_PROJECT_ID,
    dataset: "production",
  })

export const toPlainText = (blocks = []) => {
  return blocks
    .map(block => {
      if (block._type !== "block" || !block.children) {
        return ""
      }
      return block.children.map(child => child.text).join("")
    })
    .join("\n\n")
}

const builder = imageUrlBuilder(client)

export const urlFor = source => builder.image(source)

const serializers = {
  marks: {
    link: props => {
      const external = get(props, 'mark.href', '').includes('http')
      let linkOptions = external ? { target: "_blank", rel: "noreferrer", href: props.mark.href } : { href: props.mark.href }
      return h(
        "a",
        linkOptions,
        props.children
      )
    },
    highlight: props => h("mark", { className: "highlight" }, props.children),
    footnote: props => {
      return h(
        "a",
        {
          id: "link-" + props.mark._key,
          className: "footnote-link",
          href: "#note-" + props.mark._key,
        },
        props.children
      )
    },
  },
  types: {
    block: props => {
      const style = props.node.style || "normal"

      if (style === "blockquote") return h("blockquote", {}, props.children)

      if (style === "h2") return h("h2", {}, props.children)

      if (style === "h3") return h("h3", {}, props.children)

      if (style === "h4") return h("h4", {}, props.children)

      return h("p", { className: style }, props.children)
    },
    image: props => {
      return h("figure", { className: "image" }, [
        h("img", {
          src: urlFor(get(props, "node.asset", ""))
            .width(800)
            .quality(90)
            .auto("format")
            .url(),
        }),
        ...prepareTextElements(props),
      ])
    },
    embedBlock: props => {
      // YOUTUBE
      if (get(props, "node.url", "").includes("youtube")) {
        return h("figure", { className: "youtube" }, [
          h(
            "div",
            { className: "embed-container" },
            h("iframe", {
              width: "720",
              height: "480",
              src:
                "https://www.youtube.com/embed/" +
                getVideoId(props.node.url).id,
              frameborder: "no",
              allow:
                "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: true,
            })
          ),
          ...prepareTextElements(props),
        ])
      }
      // VIMEO
      if (get(props, "node.url", "").includes("vimeo")) {
        return h("figure", { className: "vimeo" }, [
          h(
            "div",
            { className: "embed-container" },
            h("iframe", {
              width: "720",
              height: "480",
              src:
                "https://player.vimeo.com/video/" +
                getVideoId(props.node.url).id,
              frameborder: "no",
              byline: false,
              color: "#ffffff",
              allow: "autoplay; fullscreen",
              allowfullscreen: true,
            })
          ),
          ...prepareTextElements(props),
        ])
      }
      // SOUNDCLOUD
      if (get(props, "node.url", "").includes("soundcloud")) {
        return h("figure", { className: "soundcloud" }, [
          h(
            "div",
            { className: "soundcloud-container" },
            h("iframe", {
              width: "100%",
              height: "300",
              src:
                "https://w.soundcloud.com/player/?url=" +
                get(props, "node.url", "") +
                "&color=%23fffff",
              frameborder: "no",
              scrolling: "no",
              allow: "autoplay",
            })
          ),
          ...prepareTextElements(props),
        ])
      }
    },
    videoBlock: props => {
      const videoUrl =
        "https://shape.anthropocene-curriculum.org/material/files/" +
        SANITY_PROJECT_ID +
        "/production/" +
        get(props, "node.videoFile.asset._ref", "")
          .replace("file-", "")
          .replace("-mp4", ".mp4")
      return h("figure", { className: "video" }, [
        h("video", {
          src: videoUrl,
          controls: true,
          loop: true,
          autoplay: get(props, "node.autoPlay", ""),
        }),
        ...prepareTextElements(props),
      ])
    },
    audioBlock: props => {
      const audioUrl =
        "https://shape.anthropocene-curriculum.org/material/files/" +
        SANITY_PROJECT_ID +
        "/production/" +
        get(props, "node.audioFile.asset._ref", "")
          .replace("file-", "")
          .replace("-mp3", ".mp3")
      return h("figure", { className: "audio" }, [
        h("audio", { src: audioUrl, controls: true }),
        ...prepareTextElements(props),
      ])
    },
  },
}

export const loadData = async (query, params) => {
  try {
    const res = await client.fetch(query, params)
    if (res === null) {
      return Promise.reject(new Error(404))
    }
    return res
  } catch (err) {
    return Promise.reject(new Error(404))
  }
}
