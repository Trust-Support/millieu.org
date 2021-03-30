import { format, getYear } from "date-fns"

export const SANITY_PROJECT_ID = "cmjhz9gg"
export const GAME_SERVER_URL = "wss://testing-gameserver.post-rational.org";

export const VIDEO_ROOMS = {MAIN: "main", SUPPORT: "support"}
export const AUDIO_ROOMS= [1,2,3,4,5,6,7]
export const TEXT_ROOMS = [1,2,3,4]
export const AREA = { YELLOW: 2, RED: 3, GREEN: 4, BLUE: 5, MAGENTA: 6, CYAN: 7, PURPLE: 8, TEAL: 9 }
export const REVERSE_HEX_MAP = { '#FFFF00': 'yellow','#FF0000':'red','#00FF00': 'green', '#0000FF': 'blue', '#FF00FF': 'magenta', '#00FFFF': 'cyan', '#880088': 'purple',  '#008888': 'teal' }
export const HEX_MAP = { YELLOW: '#FFFF00', RED: '#FF0000', GREEN: '#00FF00', BLUE: '#0000FF', MAGENTA: '#FF00FF', CYAN: '#00FFFF', PURPLE: '#880088', TEAL: '#008888' }
export const COLORMAP = ["WHITE", "BLACK", "YELLOW", "RED", "GREEN", "BLUE", "MAGENTA", "CYAN", "PURPLE", "TEAL"]
export const TINTMAP = [
  0x111111,
  0x333333,
  0x666666,
  0x777777,
  0x888888,
  0x999999,
  0xaaaaaa,
  0xcccccc,
  0xdddddd,
  0xffffff,
]
// export const TINTMAP = [0x111111, 0x666666, 0x888888, 0xaaaaaa, 0xffffff]
export const FORMATMAP = {
  pdfBlock: "PDF",
  videoBlock: "VIDEO",
  audioBlock: "AUDIO",
  imageBlock: "IMAGE",
}

export const MAP = { WIDTH: 4000, HEIGHT: 4000 }

export const QUERY = {
  GRAPHICS_SETTINGS:
    "*[_id == 'graphics-settings']{..., mapLink->{'mainImage': mainImage,'miniImage': miniImage,'pathfindingGridUrl': pathfindingGrid.asset->url}, activeAvatars[]->{title, _id, notRandom, 'spriteJsonURL': spriteJson.asset->url}}[0]",
  EXHIBITIONS:
    "*[_type == 'exhibition']{..., area->{slug,name}, participants[]->{slug,name,username}, connectedCaseStudies[]->{...,participants[]->{slug,name,username}}}",
  EVENTS:
    "*[_type == 'event']{..., moderators[]->{slug,name,username}, participants[]->{slug,name,username}, connectedCaseStudies[]->{...,participants[]->{slug,name,username}}} | order(startDate asc)",
  USERS: "*[_type == 'participant']{...,avatarLink->{'iconUrl': rest[0].asset->url}}",
  PAGES: "*[_type == 'page']",
  SEMINAR: "*[_type == 'seminar' && slug.current == $slug][0]",
  SEMINAR_PARTICIPANTS: "*[_type == 'participant' && seminarLink._ref == $id]",
  AUTH_USER_INFO:
    "*[_type == 'participant' && username == $username]{..., seminarLink->{...}}[0]",
  AUDIO_INSTALLATIONS:
    "*[_type == 'audioInstallation']{..., participants[]->{slug,name,username}, 'audioURL': soundFile.asset->url,spriteLink->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}",
  CASE_STUDIES:
    "*[_type in ['caseStudyExhibition']]{..., connectedEvents[]->{...,moderators[]->{slug,name,username}, participants[]->{slug,name,username}}, participants[]->{slug,name,username}, spriteLink->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}",
  LAND_MARKS:
    "*[_type == 'landmark']{..., 'spriteJsonURL': spriteJson.asset->url}",
  ACTIVE_STREAMS:
    "*[_id == 'active-streams']{..., mainStreamEvent->{..., moderators[]->{slug,name,username}, participants[]->{slug,name,username}, connectedCaseStudies[]->{...,participants[]->{slug,name,username}}}}[0]",
  CONNECTED_TO_USER: "*[participants[]._ref == $id || moderators[]._ref == $id]{..., moderators[]->{...}, participants[]->{...}} | order(startDate asc)",
  GLOBAL_SETTINGS: "*[_id == 'global-settings']{..., welcomeCard->{...}}[0]",
  AREAS: "*[_type == 'area']{..., informationCard->{...}}",
  PINNED_MESSAGE: "*[_id == 'pinned-message'][0]",
  AUDIOROOM_NAMES: "*[_id == 'audioroom-names'][0]",
  TUTORIAL_CARD: "*[_id == 'tutorial-card'][0]",
}

export const TEXT_STYLE_AVATAR = {
  fontFamily: "hersheyduplex",
  fontWeight: "bold",
  fontSize: 14,
  align: "center",
  fill: "#999999",
  wordWrap: true,
  wordWrapWidth: 300,
}

export const TEXT_STYLE_AVATAR_AUTHENTICATED = {
  fontFamily: "hersheyduplex",
  fontWeight: "bold",
  fontSize: 14,
  align: "center",
  fill: "black",
  wordWrap: true,
  wordWrapWidth: 300,
}

export const TEXT_STYLE_CASE_STUDY = {
  fontFamily: "hersheyduplex",
  fontWeight: "bold",
  fontSize: 14,
  align: "center",
  fill: "white",
  wordWrap: true,
  wordWrapWidth: 300,
}

// const mainFormat = "MMM dd yyyy – HH:mm"
// const mainFormat = "MMM dd – HH:mm"
// const mainFormat = "HH:mm 'CET,' EEE MMM dd"
// const mainFormat = 'HH:mm (z) E MMM dd'
const mainFormat = 'HH:mm z, dd MMM DD'

const intlFormat = new Intl.DateTimeFormat('en-DE', {
  hour: 'numeric',
  minute: 'numeric',
  weekday: 'short',
  month: 'short',
  day: '2-digit',
  timeZone: 'CET',
})

export const formattedDate = (start, end) => {
  try {
    if (!start) {
      return false
    }
    const startDate = Date.parse(start)
    const dateParts = intlFormat.formatToParts(startDate);
    const startDateFormatted = dateParts[6].value + dateParts[7].value + dateParts[8].value + ' CET, ' + dateParts[0].value + ' ' + dateParts[4].value + ' ' + dateParts[2].value;
    // const startDateCETFormatted = startDateCET + 'CET';

    if (!startDate) {
      return false
    }

    if (!end) {
      // return formatToTimeZone(startDate, mainFormat, { timeZone: 'Europe/Berlin' })
      // return format(startDate, mainFormat)
      // console.log(dateParts);
      return startDateFormatted;
    }

    const endDate = Date.parse(end)
    // const startDate = Date.parse(start)
    const endDateParts = intlFormat.formatToParts(endDate);
    const endDateFormatted = endDateParts[6].value + endDateParts[7].value + endDateParts[8].value + ' CET, ' + endDateParts[0].value + ' ' + endDateParts[4].value + ' ' + endDateParts[2].value;


    if (startDateFormatted == endDateFormatted) {
      return startDateFormatted
    }

    const startFormat =
      getYear(startDate) == getYear(endDate) ? "dd.MM" : "dd.MM.yyyy"
    const endFormat = "dd.MM.yyyy"

    return startDateFormatted + " – " + endDateFormatted
  } catch (err) {
    console.dir(err)
  }
}

export const formattedChatDate = start => {
  try {
    const startDate = start ? start : Date.now()
    return format(startDate, "HH:mm EEE")
  } catch (err) {
    console.dir(err)
  }
}

export const nanoid = (t = 21) => {
  let e = "",
    r = crypto.getRandomValues(new Uint8Array(t))
  for (; t--; ) {
    let n = 63 & r[t]
    e +=
      n < 36
        ? n.toString(36)
        : n < 62
        ? (n - 26).toString(36).toUpperCase()
        : n < 63
        ? "_"
        : "-"
  }
  return e
}

export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
  Math.ceil(min)

export function debounce(fn, wait = 1) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.call(this, ...args), wait)
  }
}
