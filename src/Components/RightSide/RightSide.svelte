<script>
    import { getContext } from "svelte";
    import api from "../../Data/api";
    import MyMessage from "../MyMessage/MyMessage.svelte";
    import CompanionMessage from "../CompanionMessage/CompanionMessage.svelte";
    import MessageWindow from "../MessageWindow/MessageWindow.svelte";

    const { selectedChat, messages, chatDetails} = getContext('store');

    export let loadMessages;
    export let hasMore;
    export let isLoading;
    export let dialogue;
    export let userId;
    export let getMessageDate;
    export let socket;

    let editingId = null;
    let messageContent = '';
    let editingMessage = '';
    let selectedFile = null;
    let filePreview = null;
    let messageWindow = null;

    const getChatDetails = async(chatId) => {
        const result = await api.get(`/chats/details/${chatId}`)
        .then((result) => {
            return result.data;
        }).catch((error) => {
            console.log(error);
        });
        $chatDetails = result;
        return result;
    }

    const handleScroll = (e) => {
        const container = e.target;
        if (container.scrollTop === 0 && hasMore && !isLoading) {
            loadMessages();
        }
    }


    const editMessage = (message) => {
        editingId = message.id;
        messageContent = editingMessage = message.content;
    }

    const handleFileChange = (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            filePreview = URL.createObjectURL(selectedFile);
        }
    };
    const deleteFile = () => {
        selectedFile = null;
        filePreview = "";
    }

    const closeChat = () => {
        $selectedChat = null;
        $messages = [];
        $chatDetails = null;
        if (socket && $selectedChat) {
            socket.emit("leaveChat", $selectedChat);
        }
    }

    const cancelEdit = () => {
        editingId = null;
        messageContent = editingMessage = "";
    }

</script>

<svelte:window on:keydown={(e) => {
    if (e.key === 'Escape') {
        if(editingId) {
            cancelEdit();
        } else {
            closeChat();
        }
    }
}}/>

<div class="chat__right">
    {#if $selectedChat}
        {#await getChatDetails($selectedChat)}
            <h4 class="loader">Loading...</h4>
        {:then chatResult}
            {#if chatResult}
                <div class="chat__right-top">
                    <img class="chat__right-top__img" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user">
                    <div class="chat__right-top__box">
                        <span class="chat__right-top__username">
                            {chatResult.interlocutor.username}
                        </span>
                    </div>
                </div>
                <div class="chat__right-body">
                    <div class="chat__right-body__dialogue" on:scroll={handleScroll} bind:this={dialogue}>
                        {#each $messages as message}
                            {#if message.sender_id === userId}
                                <MyMessage 
                                    {message} 
                                    {getMessageDate} 
                                    {editMessage} 
                                />
                            {:else}
                                <CompanionMessage 
                                    {message} 
                                    {getMessageDate} 
                                />
                            {/if}
                        {/each}
                    </div>

                    <MessageWindow 
                        {messageContent}
                        {editingId}
                        {deleteFile}
                        {handleFileChange}
                        {filePreview}
                        {messageWindow}
                        {editingMessage}
                        {cancelEdit}
                        {userId}
                        {selectedFile}
                    />

                </div>
            {/if}
        {/await}
    {/if}

</div>

<style lang="scss">
    .chat {
        &__right {
            width: 100%;
            height: 100%;
            background-image: url(../../../public/images/bg_print.png);
            background-position: center;
            background-repeat: repeat;
            background-size: cover;
            position: relative;

            &-top {
                display: flex;
                align-items: center;
                gap: 16px;
                background-color: #FFF;
                height: 56px;
                padding: 8px 16px;
                border-left: 1px solid #D9DCE0;
                box-shadow: 2px 2px 6px rgba(0, 0, 0, 50%);
                top: 0;
                left: 0;
                right: 0;
                position: absolute;

                &__img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                }

                &__box {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                &__username {
                    display: inline-block;
                    font-size: 16px;
                    line-height: 20px;
                    font-weight: 500;
                    color: #011627;
                }

                &__status {
                    display: inline-block;
                    font-size: 14px;
                    line-height: 16px;
                    font-weight: 400;
                    color: #707991;
                }
            }

            &-body {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                height: calc(100% - 56px);
                padding: 0 15% 26px;
                left: 0;
                right: 0;
                bottom: 0;
                position: absolute;

                &__dialogue {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    max-height: 100%;
                    overflow: auto;
                    margin-bottom: 16px;
                    padding-top: 25px;

                    &::-webkit-scrollbar {
                        width: 0;
                        background-color: transparent;
                    }
                }

                &__time {
                    display: inline-block;
                    align-self: center;
                    font-size: 16px;
                    line-height: 20px;
                    color: #FFF;
                    padding: 4px 12px;
                    border-radius: 12px;
                    background: rgba(#3D70B8, .6);
                }
            }
        }
    }
</style>