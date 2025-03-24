<script>
    import { getContext, onMount } from "svelte";
    import api from "../../Data/api";
    import { io } from "socket.io-client";
    import LeftSide from "../../Components/LeftSide/LeftSide.svelte";
    import RightSide from "../../Components/RightSide/RightSide.svelte";

    const { selectedChat, messages, chats} = getContext('store');

    let socket;
    let userId = Number(localStorage.getItem('userId'));
    let limit = 20;
    let offset = 0;
    let isLoading = false;
    let hasMore = true;
    let dialogue;

    const joinChatRoom = (chatId) => {
        if(!socket) return;
        $selectedChat = chatId;
        socket.emit("joinChat", $selectedChat);
        loadMessages({ reset: true });
        setChatReaded($selectedChat);
        getAvailableChats().then((result) => {
            const updated = [...result];
            const index = updated.findIndex((c) => c.id === $selectedChat);
            if (index !== -1) {
                updated[index].unread_count = 0;
            }
            $chats = updated;
        });
        setTimeout(() => {
            if(dialogue) {
                dialogue.scrollTop = dialogue.scrollHeight + 100
            }
        }, 100);
    };

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

    onMount(async () => {
        $chats = getAvailableChats();
        socket = io("http://172.120.0.29:1337/", {
            query: { userId }
        });
        socket.on("newMessage", (message) => {
            if(message?.chat_id === $selectedChat) {
                $messages = [...$messages, message];
                setChatReaded($selectedChat);
                document.title = "WhatsGram"
            }

            if(!$selectedChat || document.hidden) {
                document.title = "You have a new message!";
            } else {
                document.title = "WhatsGram"
            }
            
            getAvailableChats().then((result) => {
                const updated = [...result];
                const index = updated.findIndex((c) => c.id === message.chat_id);
                if (index !== -1) {
                    updated[index].lastMessage = message;
                    updated[index].unread_count = 0;
                    const [moved] = updated.splice(index, 1);
                    updated.unshift(moved);
                }
                $chats = updated;
            })
            
            if(dialogue) {
                setTimeout(() => {
                    dialogue.scrollTo({
                        top: dialogue.scrollHeight + 100,
                        behavior: "smooth"
                    })
                }, 50)
            }
        });
        socket.on("messageEdited", (editedMessage) => {
            messages.update((msgs) =>
                msgs.map((msg) => (msg.id === editedMessage.id ? editedMessage : msg))
            );

            chats.update((chatArray) => {
                const updated = [...chatArray];
                const index = updated.findIndex((c) => c.id === editedMessage.chat_id);
                if (index !== -1) {
                updated[index].lastMessage = editedMessage;
                }
                return updated;
            });
        });
    });


    const setChatReaded = async (chatId) => {
        const result = await api.post('/messages/read', {
            chatId,
            userId: userId
        })

        return result.data;
    }

    const loadMessages = async ({ reset = false } = {}) => {
        if (isLoading) return;
        isLoading = true;
        if (reset) {
            offset = 0;
            messages.set([]);
            hasMore = true;
        }

        try {
            const res = await api.get(`/messages/${$selectedChat}`, {
                params: { limit, offset }
            });
            const newMsgs = res.data;
            if (newMsgs.length < limit) {
                hasMore = false;
            }
            messages.update((msgs) => [...newMsgs, ...msgs]);
            offset += newMsgs.length;
        } catch (error) {
            console.error("Ошибка загрузки сообщений:", error);
        }
        isLoading = false;
    }


</script>

<div class="chat">
    <LeftSide 
        onGetMessageDate={getMessageDate}
        globalUserId={userId}
        joinChatRoom={joinChatRoom}
    />
    <RightSide 
        {loadMessages} 
        {hasMore} 
        {isLoading} 
        {userId}
        {getMessageDate}
        {socket}
        bind:dialogue
    />
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
    }
</style>