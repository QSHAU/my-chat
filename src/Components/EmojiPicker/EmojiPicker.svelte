<script>
    import { EmojiButton } from "@joeattardi/emoji-button";
    import { createEventDispatcher, onDestroy } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    const picker = new EmojiButton();
    let trigger;
  
    picker.on("emoji", selection => {
      dispatch("change", selection);
    });
  
    function togglePicker() {
      picker.togglePicker(trigger);
    }
    onDestroy(() => {
        picker.destroyPicker();
    })
  </script>
  
  <button class="emoji-btn" bind:this={trigger} on:click={togglePicker} />

<style lang="scss">
    .emoji-btn {
        display: flex;
        width: 24px;
        height: 24px;
        border: none;
        background-color: transparent;
        cursor: pointer;
        padding: 0;
        transform: translateY(-50%);
        right: 50px;
        top: 50%;
        position: absolute;

        &::before {
            content: '';
            width: 16px;
            height: 16px;
            background-image: url('../../../public/icons/emoji-icon.svg');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            pointer-events: none;
            transform: translate(-50%, -50%);
            top: 50%;
            left: 50%;
            position: absolute;
        }
    }


</style>