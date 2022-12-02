<svelte:options accessors />

<script>
  import { tick } from "svelte";

  export let options;
  export let selectId;
  export let containerClass = undefined;
  export let title = undefined;
  export let placeHolder = "Select an item...";

  let filteredOptions;
  let selectedValues = [];
  let open = false;
  let dropdown;
  let input;
  let selectEl;
  let hasGroups = !Array.isArray(options);

  const resetFilteredOptions = () => {
    if (hasGroups) {
      filteredOptions = Object.values(options)
        .map((group) => group.options)
        .flat();
    } else {
      filteredOptions = options;
    }
  };

  const activateDropdown = async () => {
    if (open) return;
    resetFilteredOptions();
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
    resetFilteredOptions();

    if (!input.innerHTML) return;

    if (input.innerText) {
      const searchParts = input.innerText.toLowerCase().split(" ");

      filteredOptions = filteredOptions.filter((option) =>
        searchParts.every((searchPart) =>
          option.label.toLowerCase().includes(searchPart),
        ),
      );
    }
  };

  const selectedValuesUpdated = async () => {
    if (selectEl) {
      await tick();
      selectEl.dispatchEvent(
        new CustomEvent("updated", {
          bubbles: false,
          detail: selectedValues,
        }),
      );
    }
  };
</script>

<div
  {title}
  id={selectId}
  bind:this={selectEl}
  class={`container ${containerClass || ""}`}
  on:clear={() => (selectedValues = [])}
>
  <span
    class="input"
    spellcheck="false"
    contenteditable="true"
    data-selected={selectedValues.length}
    class:show-indicator={selectedValues.length}
    bind:this={input}
    on:input={search}
    on:focus={activateDropdown}
    on:mousedown|preventDefault={toggleDropdown}>{@html placeHolder}</span
  >
  {#if selectedValues.length}
    <button
      on:click={() => {
        selectedValues = [];
        selectedValuesUpdated();
      }}>×</button
    >
  {/if}

  <div class="dropdown" class:open bind:this={dropdown}>
    {#if hasGroups}
      {#each Object.keys(options) as group}
        {@const subOptions = options[group].options}
        {@const optionValues = subOptions.map((o) => o.value)}
        <label class="group">
          <input
            type="checkbox"
            checked={optionValues.every((option) =>
              selectedValues.includes(option),
            )}
            indeterminate={optionValues.some((option) =>
              selectedValues.includes(option),
            ) &&
              !optionValues.every((option) => selectedValues.includes(option))}
            on:change={({ target }) => {
              if (target.checked) {
                // select all options for this group
                selectedValues = [
                  ...new Set([...selectedValues, ...optionValues]),
                ];
              } else {
                // unselect all options for this group
                selectedValues = selectedValues.filter(
                  (option) => !optionValues.includes(option),
                );
              }
              selectedValuesUpdated();
            }}
          />
          {group} [{options[group].count}]
        </label>
        {#each subOptions as option}
          {#if filteredOptions?.includes(option)}
            <label class="suboption">
              <input
                type="checkbox"
                value={option.value}
                bind:group={selectedValues}
                on:change={selectedValuesUpdated}
              />
              {option.label}
            </label>
          {/if}
        {/each}
      {/each}
    {:else}
      {#each options as option}
        {#if filteredOptions?.includes(option)}
          <label>
            <input
              type="checkbox"
              value={option.value}
              bind:group={selectedValues}
              on:change={selectedValuesUpdated}
            />
            {option.label}
          </label>
        {/if}
      {/each}
    {/if}
    {#if !filteredOptions?.length}
      <span>No matching options</span>
    {/if}
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
    border: 1px solid white;
    border-radius: 4px;
    display: none;
    flex-direction: column;
    max-height: 90vh;
    min-width: 100%;
    overflow-y: auto;
    padding: 0.5em 0.5em 1em;
    position: absolute;
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
    padding: 5px 75px 5px 11px;
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
      right: 48px;
      top: 7px;
    }
  }

  button {
    color: white;
    font-size: 25px;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }

  label {
    &.group {
      font-size: 1.1em;
      font-weight: bold;
      margin: 1em 0 0.5em;
    }

    &.suboption {
      margin-left: 10px;
    }
  }
</style>
