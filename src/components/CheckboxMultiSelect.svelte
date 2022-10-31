<svelte:options accessors />

<script>
  import { tick } from "svelte";

  export let options;
  export let selectId;
  export let containerClass = undefined;
  export let title = undefined;
  export let placeHolder = "Select an item...";

  let selectedOptions = [];
  let filteredOptions = options;
  let open = false;
  let dropdown;
  let input;
  let selectEl;

  const activateDropdown = async () => {
    if (open) return;
    filteredOptions = options;
    open = true;
    await tick();
    input.innerHTML = "";
    input.focus();
  };

  const closeDropdown = () => {
    open = false;
    input.innerHTML = placeHolder;
    input.blur();
  };

  const toggleDropdown = () => (open ? closeDropdown() : activateDropdown());

  const search = async () => {
    open = true;
    filteredOptions = options;

    if (!input.innerHTML) return;

    if (input.innerText) {
      const searchParts = input.innerText.toLowerCase().split(" ");

      filteredOptions = filteredOptions.filter((options) =>
        searchParts.every((searchPart) =>
          options.label.toLowerCase().includes(searchPart),
        ),
      );
    }
  };

  const selectedOptionsUpdated = async () => {
    if (selectEl) {
      await tick();
      selectEl.dispatchEvent(
        new Event("updated", { bubbles: false, target: selectEl }),
      );
    }
  };

  $: selectedOptions, selectedOptionsUpdated();
</script>

<div {title} class={`container ${containerClass || ""}`}>
  <select
    multiple
    id={selectId}
    bind:value={selectedOptions}
    bind:this={selectEl}
  >
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <span
    class="input"
    spellcheck="false"
    contenteditable="true"
    data-selected={selectedOptions.length}
    class:show-indicator={selectedOptions.length}
    bind:this={input}
    on:input={search}
    on:focus={activateDropdown}
    on:mousedown|preventDefault={toggleDropdown}>{@html placeHolder}</span
  >

  <div class="dropdown" class:open bind:this={dropdown}>
    {#each filteredOptions as option}
      <label>
        <input
          type="checkbox"
          value={option.value}
          bind:group={selectedOptions}
        />
        {option.label}
      </label>
    {/each}
  </div>
</div>

<svelte:window
  on:click={({ target }) => {
    if (open && !(dropdown.contains(target) || input.contains(target))) {
      closeDropdown();
    }
  }}
  on:keydown|stopPropagation={({ key }) => {
    if (open && key === "Escape") closeDropdown();
  }}
/>

<style>
  select {
    display: none;
  }

  .container {
    background-color: #555;
    border-radius: 4px;
    position: relative;

    &:after {
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid currentColor;
      content: "";
      height: 0;
      margin-top: -2px;
      pointer-events: none;
      position: absolute;
      right: 8px;
      top: 50%;
      width: 0;
    }
  }

  .dropdown {
    background-color: inherit;
    border-radius: 4px;
    display: none;
    flex-direction: column;
    position: absolute;
    min-width: 100%;
    width: max-content;
    z-index: 9;

    &.open {
      display: flex;
    }
  }

  span.input {
    cursor: pointer;
    display: inline-block;
    height: 100%;
    line-height: calc(2.25em - 4px);
    overflow: hidden;
    padding: 5px 60px 5px 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;

    &.show-indicator::after {
      background-color: var(--primary-accent);
      border-radius: 8px;
      content: attr(data-selected);
      display: block;
      line-height: 25px;
      padding: 0 6px;
      position: absolute;
      right: 26px;
      top: 7px;
    }
  }
</style>
