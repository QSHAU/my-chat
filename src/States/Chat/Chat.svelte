<script>
    import { getContext } from "svelte";
    import api from "../../Data/api";
    import EmojiPicker from "../../Components/EmojiPicker/EmojiPicker.svelte";
    import { io } from "socket.io-client";

    const {searchUserActive, selectedChat, messages, chatDetails} = getContext('store');

    let socket;
    let pickedEmoji = '';
    let searchInput;
    let searchQuery = "";
    let serachedUsers = [];
    let searchTimeout;
    let messageContent = '';
    let userId = Number(localStorage.getItem('userId'));

    const searchUsers = async () => {
        if (searchQuery.length < 2) {
            serachedUsers = [];
            return;
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const response = await api.get('/auth/search', {
                params: {
                    query: searchQuery
                }
            });
            serachedUsers = response.data;
        }, 300);
    }

    const createChat = async (userId, recipientId) => {
        const res = await api.post('/chats/create', {userId, recipientId});
        const chat = res.data;
        
        if (chat.id) {
            joinChatRoom(chat.id); // Открываем чат после создания
        }
    }

    const joinChatRoom = (chatId) => {
        console.log(chatId);
        
        $selectedChat = chatId;
        if (socket && $selectedChat) {
            socket.emit("leaveChat", $selectedChat);
            socket.disconnect();
            socket = null;
            console.log(`Выходим из комнаты chat_${$selectedChat}`);
        } else {
            socket = io("http://172.120.0.29:1337/", {
                query: { userId }
            });
        }
        socket.emit("joinChat", chatId);
        socket.on("connect", () => {
            console.log("Socket подключен, id:", socket.id);
        });
        socket.on("newMessage", (message) => {
            $messages = [...$messages, message];
        });
        getMessages(chatId);
        setChatReaded(chatId);
    };

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

    const getMessages = async(chatId) => {
        $messages = await api.get(`/messages/${chatId}`)
        .then((result) => {
            return result.data;
        }).catch((error) => {
            console.log(error);
        });
    }

    const closeSearch = () => {
        if(searchQuery.length < 2) {
            $searchUserActive = false;
        }
    }

    const closeChat = (e) => {
        if(e.keyCode === 27) {
            $selectedChat = null;
            $messages = [];
            $chatDetails = null;
            if (socket && $selectedChat) {
                socket.emit("leaveChat", $selectedChat);
                socket.disconnect();
                socket = null;
                console.log(`Выходим из комнаты chat_${$selectedChat}`);
            }
        }
    }

    const getMessageDate = (date) => {
        let localeDate = new Date(date);
        let h = localeDate.getHours();
        let m = localeDate.getMinutes();
        
        return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
    }

    const getAvailableChats = async () => {
        const result = await api.get(`/chats/${userId}`);

        return result.data;
    }

    const onEmojiChange = (event) => {
        pickedEmoji = event.detail.emoji;
        messageContent += pickedEmoji;
    }

    const sendMessage = async (e) => {
        e.preventDefault();
        if(messageContent.trim().length > 0) {
            await api.post(`/messages`, {
                chat_id: $selectedChat,
                sender_id: userId,
                content: messageContent,
            });
            messageContent = '';
        }
    }

    const setChatReaded = async (chatId) => {
        const result = await api.post('/messages/read', {
            chatId,
            userId: userId
        })

        return result.data;
    }
</script>
<svelte:document on:keyup={closeChat} />

<div class="chat">
    <aside class="chat__left">
        <div class="chat__left-header">
            <div class="chat__left-header__search">
                <input type="text" placeholder="Search" 
                    bind:this={searchInput} 
                    bind:value={searchQuery} 
                    on:input={searchUsers}
                    on:focus={() => $searchUserActive = true}
                    on:focusout={closeSearch} 
                />
            </div>
        </div>
        <div class="chat__left-body">
            {#if $searchUserActive}
                {#each serachedUsers as user}
                    <div class="chat__left-body__item" on:click={() => createChat(userId, user.id)}>
                        <img class="chat__left-body__img" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user">
                        <div class="chat__left-body__right">
                            <div class="chat__left-body__top">
                                <span class="chat__left-body__username">
                                    {user.username}
                                </span>
                            </div>
                        </div>
                    </div>
                {/each}
            {:else}
            {#await getAvailableChats()}
                ...
            {:then chatsResult} 
                {#if chatsResult}
                    {#each chatsResult as chat}
                        <div class="chat__left-body__item" on:click={() => joinChatRoom(chat.id)}>
                            <img class="chat__left-body__img" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user">
                            <div class="chat__left-body__right">
                                <div class="chat__left-body__top">
                                    <span class="chat__left-body__username">
                                        {chat?.users[1].username}
                                    </span>
                                    <span class="chat__left-body__time">
                                        {#if chat?.lastMessage?.created_at}
                                            {getMessageDate(chat.lastMessage?.created_at)}
                                        {/if}
                                    </span>
                                </div>
                                {#if chat?.lastMessage}
                                    <div class="chat__left-body__bottom">
                                        <span class="chat__left-body__message">
                                            {#if chat?.lastMessage?.sender_id === userId}
                                                You:
                                            {/if}
                                            {chat?.lastMessage?.content}
                                        </span>
                                        {#if chat.unread_count}
                                            <span class="chat__left-body__status">
                                                {chat.unread_count}
                                            </span>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            {/await}
            {/if}
        </div>
    </aside>
    <div class="chat__right">
        {#await $selectedChat && getChatDetails($selectedChat)}
            <h4 class="loader">Loading...</h4>
        {:then chatResult}
            {#if chatResult}
                <div class="chat__right-top">
                    <img class="chat__right-top__img" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user">
                    <div class="chat__right-top__box">
                        <span class="chat__right-top__username">
                            {chatResult.interlocutor.username}
                        </span>
                        <span class="chat__right-top__status">
                            last seen 5 mins ago
                        </span>
                    </div>
                </div>
                <div class="chat__right-body">
                    <div class="chat__right-body__dialogue">
                        <span class="chat__right-body__time">
                            Today
                        </span>
                        {#each $messages as message}
                            {#if message.sender_id === userId}
                                <div class="chat__right-body__me">
                                    <span class="chat__right-body__me-text">
                                        {message.content}
                                    </span>
                                    <div class="chat__right-body__me-info">
                                        <span class="time">
                                            {getMessageDate(new Date(message.created_at))}
                                        </span>
                                        <span class="status" />
                                    </div>
                                </div>
                            {:else}
                                <div class="chat__right-body__companion">
                                    <span class="chat__right-body__companion-text">
                                        {message.content}
                                    </span>
                                    <div class="chat__right-body__companion-info">
                                        <span class="time">
                                            {getMessageDate(new Date(message.created_at))}
                                        </span>
                                        <span class="status" />
                                    </div>
                                </div>
                            {/if}
                        {/each}

                    </div>
                    <div class="chat__right-body__message">
                        <EmojiPicker on:change={onEmojiChange} />
                        <form class="chat__right-body__message-form" on:submit={(e) => sendMessage(e)}>
                            <input class="chat__right-body__message-window" 
                                type="text" 
                                placeholder="Message"
                                bind:value={messageContent}
                            />
                            <button class="chat__right-body__message-send" type="submit" />
                        </form>
                    </div>
                </div>
            {/if}
        {/await}

    </div>
</div>


<style lang="scss">
    .chat {
        display: flex;
        width: 100%;
        height: 100%;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        position: absolute;

        &__left {
            background-color: #FFF;
            width: 28%;
            position: relative;

            &-header {
                background-color: #FFF;
                height: 56px;
                padding: 8px 16px;
                margin-bottom: 8px;
            }

            &-header__search {
                position: relative;

                &::before {
                    content: '';
                    width: 18px;
                    height: 18px;
                    background-image: url('../../../public/icons/search-icon.svg');
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    pointer-events: none;
                    left: 18px;
                    top: 10px;
                    position: absolute;
                }
            }

            &-header__search input {
                display: inline-block;
                font-size: 16px;
                line-height: 20px;
                color: #011627;
                font-weight: 400;
                background-color: #F5F5F5;
                border-radius: 22px;
                width: 100%;
                max-width: 340px;
                padding: 10px 16px 10px 48px;
                border: none;
                outline: none;

                &::placeholder {
                    color: #707991;
                    transition: color .3s;
                }

                &:hover::placeholder {
                    color: #011627;
                }
            }

            &-body {
                &__item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    background-color: #FFF;
                    transition: background-color .3s;
                    cursor: pointer;

                    &:hover {
                        background-color: #F5F5F5;
                    }
                }

                &__img {
                    display: inline-block;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                &__right {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 100%;
                    gap: 4px;
                }

                &__top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                &__username {
                    display: inline-block;
                    font-size: 16px;
                    line-height: 20px;
                    font-weight: 500;
                    color: #011627;
                }

                &__time {
                    display: inline-block;
                    font-size: 12px;
                    line-height: 16px;
                    font-weight: 400;
                    color: #707991;
                }

                &__bottom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                &__message {
                    display: inline-block;
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: 400;
                    color: #707991;
                    text-overflow: ellipsis;
                }

                &__status {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    line-height: 16px;
                    font-weight: 400;
                    color: #FFF;
                    width: 18px;
                    height: 18px;
                    background-color: #78E378;
                    border-radius: 50%;
                }
            }
        }

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
                    justify-content: flex-end;
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

                &__companion {
                    display: flex;
                    flex-direction: column;
                    align-self: flex-start;
                    background-color: #FFF;
                    padding: 4px 12px;
                    gap: 4px;
                    max-width: 400px;
                    border-radius: 12px;

                    &-text {
                        font-size: 16px;
                        line-height: 20px;
                        font-weight: 500;
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
                                content: '';
                                width: 10px;
                                height: 8px;
                                background-image: url('../../../public/icons/message-check.svg');
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
                }

                &__me {
                    display: flex;
                    flex-direction: column;
                    align-self: flex-end;
                    background-color: #78E378;
                    padding: 4px 12px;
                    gap: 4px;
                    max-width: 400px;
                    border-radius: 12px;

                    &-text {
                        font-size: 16px;
                        line-height: 20px;
                        font-weight: 500;
                    }

                    &-info {
                        display: flex;
                        align-items: center;
                        align-self: flex-end;
                        gap: 4px;

                        .time {
                            font-size: 12px;
                            color: #FFF;
                        }

                        .status {
                            width: 14px;
                            height: 14px;
                            position: relative;

                            &::before {
                                content: '';
                                width: 10px;
                                height: 8px;
                                background-image: url('../../../public/icons/message-check-white.svg');
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
                }

                &__message {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 0px 16px;
                    background-color: #FFF;
                    border-radius: 12px;
                }

                &__message-form {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                &__message-window {
                    font-size: 16px;
                    line-height: 20px;
                    padding: 16px 16px 16px 0px;
                    width: 100%;
                    border: none;
                    outline: none;

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
                        content: '';
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
        }
    }
</style>