<script>
  // # # # # # # # # # # # # #
  //
  //  Case Study List
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import Fuse from "fuse.js"
  import { renderBlockText } from "../sanity.js"

  // COMPONENTS
  import ParticipantsList from "./ParticipantsList.svelte"

  // *** PROPS
  export let caseStudies = []
  export let related = false

  // *** STORES
  import { globalSettings } from "../stores.js"

  // *** VARIABLES
  let filterTerm = ""
  let filteredCaseStudies = []
  let orderedCaseStudies = {}
  let fuseList = {}
  let sortOrder = "title"

  const fuseOptions = {
    threshold: 0.2,
    keys: ["title", "category", "participants.name"],
  }

  const titleSort = (a, b) => {
    const textA = a.title ? a.title.toUpperCase() : "Undefined"
    const textB = b.title ? b.title.toUpperCase() : "Undefined"
    return textA < textB ? -1 : textA > textB ? 1 : 0
  }

  const seminarSort = (a, b) => {
    const textA = a.category ? a.category.toUpperCase() : "Undefined"
    const textB = b.category ? b.category.toUpperCase() : "Undefined"
    return textA < textB ? -1 : textA > textB ? 1 : 0
  }

  orderedCaseStudies["title"] = [...caseStudies].sort(titleSort)
  orderedCaseStudies["seminar"] = [...caseStudies].sort(seminarSort)

  fuseList["title"] = new Fuse(orderedCaseStudies["title"], fuseOptions)
  fuseList["seminar"] = new Fuse(orderedCaseStudies["seminar"], fuseOptions)

  // FILTER
  $: {
    if (filterTerm) {
      filteredCaseStudies = fuseList[sortOrder]
        .search(filterTerm)
        .map(hit => hit.item)
    } else {
      filteredCaseStudies = orderedCaseStudies[sortOrder]
    }
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  .case-study-container {
    height: 100%;
    color: $COLOR_DARK;
    font-family: $MONO_STACK;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;

    .case-study-item {
      padding: 0px $SPACE_S;
      padding-top: $SPACE_S;
      padding-bottom: $SPACE_S;
      width: 100%;
      // min-height: $ITEM_HEIGHT;
      background: $COLOR_LIGHT;
      color: $COLOR_DARK;
      display: inline-block;
      text-decoration: none;
      user-select: none;

      .inner {
        width: 100%;

        .color-icon {
          display: none;
          height: 10px;
          width: 10px;
          margin-right: $SPACE_M;
          float: left;
          margin-top: 4px;
          background: $COLOR_EXHIBITION;

          &.communication {
            background: $COLOR_COMMUNICATION;
          }
          &.consensus-building {
            background: $COLOR_CONSENSUS_BUILDING;
          }
          &.sensing {
            background: $COLOR_SENSING;
          }
          &.archiving {
            background: $COLOR_ARCHIVING;
          }
        }

        .mid-section {
          width: 60%;
          float: left;

          .title {
            font-family: $SANS_STACK;
            font-weight: 500;
          }

          .participants {
            font-family: $MONO_STACK;
            pointer-events: none;
            color: $COLOR_MID_2;
            font-size: $FONT_SIZE_SMALL;
          }
        }

        .date {
          white-space: nowrap;
          color: $COLOR_MID_2;
          float: right;
        }
      }

      transition: background 0.5s $transition;

      &:hover {
        background: $COLOR_MID_1;
      }

      &.header {
        height: 45px;
        border-bottom: 1px solid $COLOR_MID_1;
        background-color: white;
        // word-spacing: -0.3em;
        &:hover {
          background: white !important;
        }
        &.related {
          background-color: unset;
          &:hover {
            background: unset !important;
          }
        }
        .archive-link {
          color: $COLOR_MID_2;
          text-decoration: underline;
        }

        &:hover {
          background: unset;
        }
      }

      &.related {
        padding-left: 0;
        padding-right: 0;

        &.header {
          height: 30px;
          padding-top: 0;
        }
      }
    }

    .description {
      padding: $SPACE_S;
    }

    .toolbar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 45px;
      padding: $SPACE_S;
      font-size: $FONT_SIZE_SMALL;
      border-bottom: 1px dotted $COLOR_MID_1;
      margin-bottom: $SPACE_S;

      .sort {
        height: 100%;
        display: flex;
        align-items: center;

        select {
          margin-left: $SPACE_XS;
          font-size: $FONT_SIZE_SMALL;
          color: $COLOR_DARK;
          font-family: $MONO_STACK;
          border: none;
          background: $COLOR_LIGHT;
        }
      }

      .filter {
        height: 100%;
        display: flex;
        align-items: center;

        svg {
          margin-right: $SPACE_XS;
          path {
            color: $COLOR_MID_1;
          }
        }
        input {
          width: 8ch;
          border: none;
          outline: none;
          font-size: $FONT_SIZE_SMALL;
          color: $COLOR_DARK;
          font-family: $MONO_STACK;
          background: $COLOR_LIGHT;

          input[type="text"] {
            -webkit-appearance: none;
          }

          select {
            -webkit-appearance: none;
          }

          &:focus {
            border-bottom: 1px solid $COLOR_DARK;
            width: 16ch;
          }
        }
      }
    }
  }
</style>

<div class="case-study-container">
  <!-- HEADER -->
  <div class="case-study-item header" class:related>
    <div class="inner">
      <div class="row">
        <div>{related ? 'Connected Projects' : 'Projects'}</div>
      </div>
    </div>
  </div>

  {#if !related}
    <!-- TEXT -->
    {#if Array.isArray(get($globalSettings, 'caseStudyOverview.content', false))}
      <div class="description">
        {@html renderBlockText($globalSettings.caseStudyOverview.content)}
      </div>
    {/if}
    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="sort">
        <div>Sort by:</div>
        <select name="sortOrder" bind:value={sortOrder}>
          <option value="title" selected>Title</option>
          <option value="seminar">Type</option>
        </select>
      </div>
      <div class="filter">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"><path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg><input
          type="[text]"
          placeholder="Search"
          bind:value={filterTerm} />
      </div>
    </div>
  {/if}
  <!-- CASE STUDIES -->
  {#each related ? caseStudies : filteredCaseStudies as caseStudy, index (caseStudy._id)}
    <a
      class="case-study-item"
      class:related
      href={'/projects/' + get(caseStudy, 'slug.current', '')}>
      <div class="inner">
        <div class="color-icon {caseStudy.category}" />
        <div class="mid-section">
          <div class="title">{caseStudy.title}</div>
          <div class="participants">
            {#if get(caseStudy, 'participants', false) && Array.isArray(caseStudy.participants)}
              <ParticipantsList participants={caseStudy.participants} />
            {/if}
          </div>
        </div>
        <div class="date">
          {#if caseStudy.category}{caseStudy.category}{/if}
        </div>
      </div>
    </a>
  {/each}
</div>
