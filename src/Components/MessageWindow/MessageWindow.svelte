<script>
    import { getContext } from "svelte";
    import api from "../../Data/api";
    import EmojiPicker from "../EmojiPicker/EmojiPicker.svelte";

    const { selectedChat, messages } = getContext("store");

    export let messageContent;
    export let editingId;
    export let deleteFile;
    export let userId;
    export let handleFileChange;
    export let filePreview;
    export let messageWindow;
    export let editingMessage;
    export let selectedFile;
    export let cancelEdit;

    let pickedEmoji;

    const sendMessage = async (e) => {
        e.preventDefault();
        let mediaUrl = null;
        if (selectedFile) {
            const formData = new FormData();
            formData.append("media", selectedFile);
            const res = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            mediaUrl = res.data.filePath;
        }
        if (messageContent.trim().length > 0 || mediaUrl) {
            await api.post(`/messages`, {
                chat_id: $selectedChat,
                sender_id: userId,
                content: messageContent,
                media_url: mediaUrl,
            });
        }
        messageContent = "";
        selectedFile = null;
        filePreview = "";
    };

    const onEmojiChange = (event) => {
        pickedEmoji = event.detail.emoji;
        messageContent += pickedEmoji;
    };

    const adjustHeight = () => {
        if (!messageWindow) return;

        messageWindow.style.height = "auto";

        messageWindow.style.height = messageWindow.scrollHeight + "px";
        const maxHeight = 150;

        const newHeight = Math.min(messageWindow.scrollHeight, maxHeight);

        messageWindow.style.height = `${newHeight}px`;
        messageWindow.style.overflowY =
            messageWindow.scrollHeight > maxHeight ? "auto" : "";
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (messageContent.trim().length > 0) {
            const result = await api.put(`/messages/${editingId}`, {
                content: messageContent,
            });
            const updatedMessage = result.data;
            $messages = $messages.map((message) => {
                if (message.id === updatedMessage.id) {
                    message.content = updatedMessage.content;
                }
                return message;
            });
            editingId = null;
            messageContent = "";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };
</script>

<div class="chat__right-body__message">
    {#if editingId}
        <div class="chat__right-body__edit">
            <span class="edit__icon" />
            <span class="edit__text">
                {editingMessage}
            </span>
            <button class="edit__close" type="button" on:click={cancelEdit} />
        </div>
    {/if}
    {#if filePreview}
        <div class="preview">
            <div class="preview-file">
                {#if selectedFile.name.includes(".mp4")}
                    <video src={filePreview} controls />
                {:else}
                    <img src={filePreview} alt="Media" />
                {/if}
            </div>
            <button
                class="preview-cancel"
                on:click={deleteFile}
                type="button"
            />
        </div>
    {/if}
    <div class="chat__right-body__wrapper">
        <EmojiPicker on:change={onEmojiChange} />
        <form
            class="chat__right-body__message-form"
            on:submit={(e) => (editingId ? saveEdit(e) : sendMessage(e))}
        >
            <label class="chat__right-body__message-media">
                <span />
                <input
                    type="file"
                    on:change={handleFileChange}
                    accept="image/*,video/*,audio/*"
                />
            </label>
            <textarea
                placeholder="Message"
                class="chat__right-body__message-window"
                on:input={adjustHeight}
                bind:this={messageWindow}
                bind:value={messageContent}
                on:change={adjustHeight}
                on:keydown={handleKeyDown}
            />
            <button class="chat__right-body__message-send" type="submit" />
        </form>
    </div>
</div>

<style lang="scss">
    .chat__right-body {
        &__wrapper {
            display: flex;
            align-items: center;
            padding: 0px 16px;
            position: relative;
        }
        &__message {
            background-color: #fff;
            border-radius: 12px;

            .chat__right-body__edit {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 10px 40px 10px 20px;
                position: relative;

                .edit__icon {
                    width: 16px;
                    height: 13px;
                    background-image: url("../../../public/icons/edit-icon.png");
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                }

                .edit__text {
                    font-size: 12px;
                    line-height: 16px;
                    font-weight: 400;
                    color: #707991;
                    pointer-events: none;
                    position: relative;

                    &::before {
                        content: "";
                        width: 4px;
                        height: calc(100% + 4px);
                        background-color: #8babd8;
                        border-radius: 2px;
                        transform: translateY(-50%);
                        left: -10px;
                        top: 50%;
                        position: absolute;
                    }
                }

                .edit__close {
                    width: 20px;
                    height: 20px;
                    background-color: transparent;
                    border: none;
                    padding: 0;
                    flex-shrink: 0;
                    background-image: url("../../../public/icons/close-icon.svg");
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    cursor: pointer;
                    transform: translateY(-50%);
                    right: 11px;
                    top: 50%;
                    position: absolute;

                    &::before,
                    &::after {
                        content: "";
                        width: 100%;
                        height: 3px;
                        background-color: #707991;
                        border-radius: 2px;
                        transform: translate(-50%, -50%) rotate(45deg);
                        top: 50%;
                        left: 50%;
                        position: absolute;
                    }

                    &::after {
                        transform: translate(-50%, -50%) rotate(-45deg);
                    }
                }
            }
            .preview {
                max-width: 100px;
                max-height: 100px;
                margin: 10px;
                border-radius: 8px;
                position: relative;

                &-file {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    border-radius: 8px;
                }

                img,
                video {
                    display: block;
                    width: 100%;
                    height: 100%;
                    max-width: 100px;
                    max-height: 100px;
                    object-fit: cover;
                }

                &-cancel {
                    display: block;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #ccc;
                    border: 2px solid #fff;
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    cursor: pointer;

                    &::before,
                    &::after {
                        content: "";
                        width: 10px;
                        height: 2px;
                        background-color: #fff;
                        pointer-events: none;
                        transform: translate(-50%, -50%) rotate(45deg);
                        top: 50%;
                        left: 50%;
                        position: absolute;
                    }

                    &::after {
                        transform: translate(-50%, -50%) rotate(-45deg);
                    }
                }
            }
        }

        &__message-form {
            display: flex;
            align-items: center;
            width: 100%;
        }

        &__message-media {
            display: flex;
            margin-right: 16px;
            cursor: pointer;
            input {
                opacity: 0;
                width: 0;
                height: 0;
                padding: 0;
                border: none;
            }

            span {
                display: block;
                width: 20px;
                height: 20px;
                position: relative;

                &::before {
                    content: "";
                    width: 16px;
                    height: 20px;
                    background-image: url("../../../public/icons/clip-icon.svg");
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
        }

        &__message-window {
            font-size: 16px;
            line-height: 20px;
            padding: 16px 50px 16px 0px;
            min-height: 52px;
            max-height: 150px;
            height: 72px;
            resize: none;
            overflow-y: hidden;
            width: 100%;
            border: none;
            outline: none;
            transition: height 0.1s ease;

            &::placeholder {
                color: #707991;
            }
        }

        &__message-send {
            width: 24px;
            height: 24px;
            background-color: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            position: relative;

            &::before {
                content: "";
                width: 20px;
                height: 20px;
                background-image: url(../../../public/icons/send-icon.svg);
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                pointer-events: none;
                transform: translate(-50%, -50%);
                top: 50%;
                left: 50%;
                position: absolute;
            }
        }
    }
</style>
