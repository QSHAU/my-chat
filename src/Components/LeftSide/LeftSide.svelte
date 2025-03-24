<script>
    import { getContext } from "svelte";
    import api from "../../Data/api";
    
    const {searchUserActive, chats} = getContext('store');
    
    let searchInput;
    let searchQuery = '';
    let serachedUsers = [];
    let searchTimeout;

    export let onGetMessageDate;
    export let globalUserId;
    export let joinChatRoom;

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

    const closeSearch = () => {
        if(searchQuery.length < 2) {
            $searchUserActive = false;
        }
    }

    const createChat = async (userId, recipientId) => {
        const res = await api.post('/chats/create', {userId, recipientId});
        const chat = res.data;
        
        if (chat.id) {
            joinChatRoom(chat.id);
        }
    }
</script>

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
            {#if serachedUsers.length === 0 && searchQuery.length > 2}          
                <span class="chat__left-body__empty">
                    {"User not found :("}
                </span>
            {/if}
            {#each serachedUsers as user}
                <div class="chat__left-body__item" on:click={() => createChat(globalUserId, user.id)}>
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
        {#await $chats}
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
                                        {onGetMessageDate(chat.lastMessage?.created_at)}
                                    {/if}
                                </span>
                            </div>
                            {#if chat?.lastMessage}
                                <div class="chat__left-body__bottom">
                                    <span class="chat__left-body__message">
                                        {#if chat?.lastMessage?.sender_id === globalUserId}
                                            You:
                                        {/if}
                                        {chat?.lastMessage?.content}
                                        {#if chat?.lastMessage?.media_url}
                                            <span class="message-photo">
                                                Photo
                                            </span>
                                        {/if}
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

<style lang="scss">
    .chat {
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
                max-height: calc(100% - 64px);
                overflow: auto;

                &::-webkit-scrollbar {
                    display: none;
                    width: 0;
                }

                &__empty {
                    display: block;
                    font-size: 16px;
                    color: #011627;
                    text-align: center;
                    margin: 0 auto;
                }
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
                    display: -webkit-box;
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: 400;
                    color: #707991;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    word-break: break-word;

                    .message-photo {
                        color: #3D70B8;
                    }
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
    }
</style>