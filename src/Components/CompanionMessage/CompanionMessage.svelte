<script>
    export let message;
    export let getMessageDate;
</script>

<div class="chat__right-body__companion">
    <span class="chat__right-body__companion-text">
        {#if message.media_url}
            {#if message.media_url.includes(".mp4")}
                <video
                    src="http://172.120.0.29:1337/{message.media_url}"
                    controls
                />
            {:else}
                <img
                    src="http://172.120.0.29:1337/{message.media_url}"
                    alt="Media"
                />
            {/if}
        {/if}
        {message.content}
    </span>
    <div class="chat__right-body__companion-info">
        <span class="time">
            {getMessageDate(new Date(message.created_at))}
        </span>
        <span class="status" class:readed={message.is_read} />
        {#if message.edited}
            <span>edited</span>
        {/if}
    </div>
</div>

<style lang="scss">
    .chat__right-body {
        &__companion {
            display: flex;
            flex-direction: column;
            align-self: flex-start;
            background-color: #fff;
            padding: 4px 12px;
            gap: 4px;
            max-width: 400px;
            border-radius: 12px;

            &-text {
                display: flex;
                flex-direction: column;
                gap: 5px;
                font-size: 16px;
                line-height: 20px;
                font-weight: 500;
                word-break: break-word;

                img {
                    max-width: 200px;
                    max-height: 200px;
                    border-radius: 8px;
                }
            }

            &-info {
                display: flex;
                align-items: center;
                align-self: flex-end;
                gap: 4px;

                .time {
                    font-size: 12px;
                    color: #011627;
                }

                .status {
                    width: 14px;
                    height: 14px;
                    position: relative;

                    &::before {
                        content: "";
                        width: 10px;
                        height: 8px;
                        background-image: url("../../../public/icons/message-check.svg");
                        background-size: cover;
                        background-repeat: no-repeat;
                        background-position: center;
                        pointer-events: none;
                        transform: translate(-50%, -50%);
                        top: 50%;
                        left: 50%;
                        position: absolute;
                    }
                    &.readed::before {
                        width: 18px;
                        background-image: url("../../../public/icons/message-readed-black.svg");
                    }
                }

                .edited {
                    font-size: 12px;
                    color: #707991;
                }
            }
        }
    }
</style>
